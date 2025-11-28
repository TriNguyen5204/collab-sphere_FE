import { useEffect, useRef } from 'react'
import type {
    Editor,
    TLRecord,
    TLInstancePresence,
    TLInstancePresenceID,
    TLPageId,
    TLPage,
    IndexKey,
} from 'tldraw'
import { updatePageTitle } from '../../../services/whiteboardService';

// Helper type guard
function isPage(record: TLRecord): record is TLPage {
    return record.typeName === 'page'
}

export function useWhiteboardSync(
    whiteboardId: number,
    pageId: number | null, // <-- Can be null
    drawerId: string,
    drawerName: string,
    editor: Editor | null
) {
    const socketRef = useRef<WebSocket | null>(null)
    const lastSendRef = useRef(0)

    useEffect(() => {
        // Exit if the editor isn't ready or IDs are missing
        if (!editor || !whiteboardId || !pageId || !drawerId) {
            return
        }

        // Trong useWhiteboardSync.ts
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `wss://collabsphere.azurewebsites.net/ws?whiteboardId=${whiteboardId}&pageId=${pageId}&drawerId=${drawerId}&userName=${encodeURIComponent(drawerName)}`;

        const socket = new WebSocket(wsUrl);
        socket.onopen = () => console.log('✅ Connected!');
        socket.onerror = (err) => console.error('❌ Error:', err);
        socket.onclose = (e) => console.log('📴 Closed:', e.code, e.reason);
        if (socket) {
            console.log("Signal connected", socket)
        }
        socketRef.current = socket

        // --- Move ALL logic inside the 'onopen' handler ---
        socket.onopen = () => {
            console.log(`✅ Connected to page: ${pageId} as ${drawerId} and name ${drawerName}`)

            editor.updateInstanceState({
                cursor: { type: 'none', rotation: 0 },
            })

            //NEW
            const oldShapeIds = Array.from(editor.store.allRecords())
                .filter((r) => r.typeName === "shape")
                .map((r) => r.id);
            if (oldShapeIds.length) {
                editor.store.remove(oldShapeIds);
            }

            // --- Add message listener ---
            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data)

                    // --- 1. ADD THIS TO HANDLE NEW PAGES ---
                    if (msg.type === 'new_page') {
                        console.log('Real-time: New page created!', msg.page);
                        const tldrawPageId = `page:${msg.page.pageId}` as TLPageId;
                        if (!editor.store.get(tldrawPageId)) {
                            editor.store.put([{
                                id: tldrawPageId,
                                typeName: 'page',
                                name: msg.page.pageTitle,
                                index: `a${msg.page.pageId}` as IndexKey,
                                meta: {},
                            }]);
                        }
                        return;
                    }

                    // --- 2. ADD THIS TO HANDLE PAGE RENAMES ---
                    if (msg.type === 'update_page') {
                        console.log('Real-time: Page renamed!', msg.page);
                        const tldrawPageId = `page:${msg.page.pageId}` as TLRecord['id'];
                        const existingPage = editor.store.get(tldrawPageId);

                        if (existingPage && isPage(existingPage)) {
                            editor.store.put([{
                                ...existingPage,
                                name: msg.page.pageTitle,
                            }]);
                        }
                        return;
                    }

                    // DELETE PAGE
                    // inside socket.onmessage handler (in useWhiteboardSync)
                    if (msg.type === 'delete_page' && msg.page) {
                        const tldrawPageId = `page:${msg.page.pageId}` as TLRecord['id'];

                        // Remove page record
                        const existing = editor.store.get(tldrawPageId);
                        if (existing) {
                            editor.store.remove([tldrawPageId]);
                            console.log(`Real-time: Page deleted: ${tldrawPageId}`);
                        }

                        // If I'm currently viewing that page -> notify user to reload
                        const myCurrent = editor.getCurrentPageId();
                        if (myCurrent === tldrawPageId) {
                            // Simple browser dialog – you can replace with nicer toast/modal
                            const ok = window.confirm(
                                "The page you are viewing was deleted by someone else. Click OK to reload the page in your browser."
                            );
                            if (ok) {
                                window.location.reload();
                            }
                        } else {
                            // Optional: show a small toast to other users
                            // e.g., toast(`${msg.page.pageTitle ?? tldrawPageId} has been deleted.`)
                        }
                        return;
                    }

                    // ------------------------------------

                    const msgUserId = msg.userId?.toString();

                    if (msg.type === 'sync' && msg.payload) {
                        if (msgUserId && msgUserId !== drawerId) {
                            editor.store.mergeRemoteChanges(() => {
                                const { added, updated, removed } = msg.payload
                                if (added) editor.store.put(Object.values(added) as TLRecord[])
                                if (updated) editor.store.put(Object.values(updated).map((u: any) => u[1]) as TLRecord[])
                                if (removed) editor.store.remove(Object.values(removed).map((r: any) => r.id) as TLRecord['id'][])
                            })
                        }
                        else if (!msgUserId) {
                            editor.store.mergeRemoteChanges(() => {
                                const { added } = msg.payload
                                if (added) editor.store.put(Object.values(added) as TLRecord[])
                            })
                        }
                    }

                    // --- THIS IS THE FIX for 'followingUserId' ---
                    if (msg.type === 'presence' && msgUserId && msgUserId !== drawerId) {
                        const presenceId = `instance_presence:${msgUserId}` as TLInstancePresenceID
                        const presence: TLInstancePresence = {
                            id: presenceId,
                            typeName: 'instance_presence',
                            userId: msgUserId,
                            userName: msg.userName ?? msgUserId,
                            lastActivityTimestamp: Date.now(),
                            camera: { x: msg.camera.x, y: msg.camera.y, z: msg.camera.z },
                            cursor: { x: msg.x, y: msg.y, type: 'pointer', rotation: 0 },
                            color: msg.color ?? '#1E90FF',
                            currentPageId: editor.getCurrentPageId(),
                            // --- Add all missing properties ---
                            followingUserId: null,
                            selectedShapeIds: [],
                            brush: null,
                            scribbles: [],
                            screenBounds: { x: 0, y: 0, w: 1, h: 1 },
                            meta: {},
                            chatMessage: '',
                        }
                        editor.store.put([presence]);
                    }
                    // ----------------------------------------

                    if (msg.type === 'leave' && msgUserId && msgUserId !== drawerId) {
                        console.log(`${msg.userName} (ID: ${msgUserId}) left the room.`);
                        const presenceId = `instance_presence:${msgUserId}` as TLInstancePresenceID
                        editor.store.remove([presenceId])
                    }
                } catch (err) {
                    console.error('⚠️ Parse error:', err)
                }
            }

            // --- Add Tldraw store listener ---
            const cleanupStoreListener = editor.store.listen(
                (update) => {
                    if (update.source !== 'user' || socket.readyState !== WebSocket.OPEN)
                        return

                    const { changes } = update;
                    const payload = {
                        added: {} as Record<TLRecord['id'], TLRecord>,
                        updated: {} as Record<TLRecord['id'], [TLRecord, TLRecord]>,
                        removed: {} as Record<TLRecord['id'], TLRecord>,
                    };
                    let hasChanges = false;

                    // Handle page renames using whiteboardService
                    for (const [id, [from, to]] of Object.entries(changes.updated)) {
                        if (isPage(from) && isPage(to) && from.name !== to.name) {
                            console.log(`User renamed page: ${to.name}`);
                            const numericPageId = to.id.split(':')[1];

                            // Use whiteboardService instead of direct fetch
                            updatePageTitle(numericPageId, to.name).catch((err) => {
                                console.error('Error updating page title:', err);
                            });
                        }
                    }

                    for (const [id, record] of Object.entries(changes.added)) {
                        if (record.typeName === 'shape' || record.typeName === 'binding') {
                            payload.added[id as TLRecord['id']] = record;
                            hasChanges = true;
                        }
                    }
                    for (const [id, [from, to]] of Object.entries(changes.updated)) {
                        if (to.typeName === 'shape' || to.typeName === 'binding') {
                            payload.updated[id as TLRecord['id']] = [from, to];
                            hasChanges = true;
                        }
                    }
                    for (const [id, record] of Object.entries(changes.removed)) {
                        if (record.typeName === 'shape' || record.typeName === 'binding') {
                            payload.removed[id as TLRecord['id']] = record;
                            hasChanges = true;
                        }
                    }

                    if (hasChanges) {
                        socket.send(
                            JSON.stringify({
                                type: 'sync',
                                userId: drawerId,
                                pageId: pageId,
                                payload,
                            })
                        );
                    }
                },
                { source: 'user' }
            );

            // --- Add pointer move listener ---
            const handlePointerMove = () => {
                const now = Date.now()
                if (now - lastSendRef.current < 50) return
                lastSendRef.current = now

                if (!editor || socket.readyState !== WebSocket.OPEN) return

                const point = editor.inputs.currentPagePoint
                const camera = editor.getCamera()

                socket.send(
                    JSON.stringify({
                        type: 'presence',
                        userId: drawerId,
                        userName: drawerName,
                        pageId: pageId,
                        whiteboardId: whiteboardId,
                        x: point.x,
                        y: point.y,
                        camera: { x: camera.x, y: camera.y, z: camera.z },
                    })
                );
            }
            window.addEventListener('pointermove', handlePointerMove)

            // --- Set up cleanup *inside* onopen ---
            socket.onclose = () => {
                console.warn(`🔻 Disconnected from page: ${pageId}`);
                cleanupStoreListener();
                window.removeEventListener('pointermove', handlePointerMove);
                if (socketRef.current === socket) {
                    socketRef.current = null;
                }
            };
        }

        socket.onerror = (err) => {
            console.error('⚠️ Socket error:', err)
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        }

        // --- Main cleanup function ---
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'leave', drawerId: drawerId.toString(), pageId }))
                socket.close()
            }
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        }
    }, [editor, whiteboardId, pageId, drawerId, drawerName])
}