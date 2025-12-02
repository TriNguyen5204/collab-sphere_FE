import { useEffect, useRef, useCallback } from 'react'
import type {
    Editor,
    TLRecord,
    TLInstancePresence,
    TLInstancePresenceID,
    TLPageId,
    TLPage,
    IndexKey,
} from 'tldraw'

// Helper type guard
function isPage(record: TLRecord): record is TLPage {
    return record.typeName === 'page'
}

/**
 * ✅ Parse potentially concatenated JSON messages
 */
function parseWebSocketMessage(data: string): any[] {
    const messages: any[] = [];

    try {
        const singleMessage = JSON.parse(data);
        return [singleMessage];
    } catch (err) {
        // Multiple messages concatenated
    }

    let depth = 0;
    let start = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i] === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (data[i] === '}') {
            depth--;
            if (depth === 0) {
                const jsonStr = data.substring(start, i + 1);
                try {
                    const parsed = JSON.parse(jsonStr);
                    messages.push(parsed);
                } catch (parseErr) {
                    console.error('❌ Failed to parse chunk');
                }
            }
        }
    }

    if (messages.length > 1) {
        console.log(`✅ Parsed ${messages.length} concatenated messages`);
    }

    return messages;
}

/**
 * 🚀 OPTIMIZED: Request Animation Frame batching
 * Batches all changes within a single frame (~16ms) before sending
 */
class OptimizedRAFBatcher {
    private pending: {
        added: Map<string, TLRecord>,
        updated: Map<string, { from: TLRecord, to: TLRecord }>,
        removed: Map<string, TLRecord>
    } = {
            added: new Map(),
            updated: new Map(),
            removed: new Map()
        };

    private rafId: number | null = null;
    private socket: WebSocket;
    private drawerId: string;
    private pageId: number;
    private lastSendTime: number = 0;
    private minSendInterval: number = 16; // ~60fps max

    constructor(socket: WebSocket, drawerId: string, pageId: number) {
        this.socket = socket;
        this.drawerId = drawerId;
        this.pageId = pageId;
    }

    addChange(type: 'added' | 'updated' | 'removed', id: string, record: TLRecord, from?: TLRecord) {
        // Optimize: If added then removed in same batch, skip both
        if (type === 'added') {
            this.pending.removed.delete(id);
            this.pending.updated.delete(id);
            this.pending.added.set(id, record);
        } else if (type === 'updated') {
            if (this.pending.added.has(id)) {
                // If already added in this batch, just update the added record
                this.pending.added.set(id, record);
            } else {
                const existing = this.pending.updated.get(id);
                const originalFrom = existing ? existing.from : (from || record);
                this.pending.updated.set(id, { from: originalFrom, to: record });
            }
        } else if (type === 'removed') {
            if (this.pending.added.has(id)) {
                // Added then removed = noop
                this.pending.added.delete(id);
            } else {
                this.pending.updated.delete(id);
                this.pending.removed.set(id, record);
            }
        }

        // Schedule flush
        this.scheduleFlush();
    }

    private scheduleFlush() {
        if (this.rafId !== null) return;

        this.rafId = requestAnimationFrame(() => {
            this.flush();
        });
    }

    flush() {
        this.rafId = null;

        const now = performance.now();
        const timeSinceLastSend = now - this.lastSendTime;

        // Throttle: Don't send more than 60 times per second
        if (timeSinceLastSend < this.minSendInterval) {
            this.scheduleFlush(); // Reschedule
            return;
        }

        const hasChanges =
            this.pending.added.size > 0 ||
            this.pending.updated.size > 0 ||
            this.pending.removed.size > 0;

        if (!hasChanges || this.socket.readyState !== WebSocket.OPEN) return;

        // Convert Maps to Objects for JSON
        const payload = {
            added: Object.fromEntries(this.pending.added),
            updated: Object.fromEntries(
                Array.from(this.pending.updated.entries()).map(([id, { from, to }]) => [id, [from, to]])
            ),
            removed: Object.fromEntries(this.pending.removed)
        };

        // Clear immediately
        this.pending.added.clear();
        this.pending.updated.clear();
        this.pending.removed.clear();

        try {
            this.socket.send(JSON.stringify({
                type: 'sync',
                userId: this.drawerId,
                pageId: this.pageId,
                payload: payload,
            }));

            this.lastSendTime = now;

            const total = Object.keys(payload.added).length +
                Object.keys(payload.updated).length +
                Object.keys(payload.removed).length;

            if (total > 0) {
                console.log(`⚡ Batched ${total} changes in one message`);
            }
        } catch (error) {
            console.error('❌ Failed to send batch:', error);
            // Restore on failure
            Object.entries(payload.added).forEach(([id, rec]) => this.pending.added.set(id, rec));
            Object.entries(payload.updated).forEach(([id, [from, to]]) =>
                this.pending.updated.set(id, { from, to })
            );
            Object.entries(payload.removed).forEach(([id, rec]) => this.pending.removed.set(id, rec));
        }
    }

    destroy() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        // Send final batch
        this.flush();
    }
}

/**
 * 🚀 OPTIMIZED: Presence (cursor) throttling
 */
class PresenceThrottler {
    private lastPosition: { x: number, y: number, camera: any } | null = null;
    private lastSendTime: number = 0;
    private throttleInterval: number = 50; // Send max 20 times/second
    private timeoutId: number | null = null;
    private socket: WebSocket;
    private payload: any;

    constructor(socket: WebSocket, payload: any) {
        this.socket = socket;
        this.payload = payload;
    }

    update(x: number, y: number, camera: any) {
        this.lastPosition = { x, y, camera };

        const now = performance.now();
        const timeSinceLastSend = now - this.lastSendTime;

        // If enough time has passed, send immediately
        if (timeSinceLastSend >= this.throttleInterval) {
            this.send();
        } else {
            // Otherwise, schedule a send
            if (this.timeoutId === null) {
                this.timeoutId = window.setTimeout(() => {
                    this.send();
                }, this.throttleInterval - timeSinceLastSend);
            }
        }
    }

    private send() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        if (!this.lastPosition || this.socket.readyState !== WebSocket.OPEN) return;

        try {
            this.socket.send(JSON.stringify({
                ...this.payload,
                type: 'presence',
                x: this.lastPosition.x,
                y: this.lastPosition.y,
                camera: this.lastPosition.camera,
            }));

            this.lastSendTime = performance.now();
        } catch (error) {
            console.error('❌ Failed to send presence:', error);
        }
    }

    destroy() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

export function useWhiteboardSync(
    whiteboardId: number,
    pageId: number | null,
    drawerId: string,
    drawerName: string,
    editor: Editor | null
) {
    const socketRef = useRef<WebSocket | null>(null)
    const batcherRef = useRef<OptimizedRAFBatcher | null>(null)
    const presenceRef = useRef<PresenceThrottler | null>(null)
    const isConnecting = useRef(false)
    const isMounted = useRef(true)
    const reconnectTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        }
    }, [])

    useEffect(() => {
        if (!editor || !whiteboardId || !drawerId) {
            if (editor) { // Only warn if editor exists but other params missing
                console.warn('⚠️ Missing required params:', {
                    hasEditor: !!editor,
                    whiteboardId,
                    pageId,
                    drawerId
                });
            }
            return
        }

        if (!pageId) {
            // PageId will be set after pages are loaded, this is normal
            return
        }

        if (isConnecting.current || socketRef.current?.readyState === WebSocket.OPEN) {
            console.warn('⚠️ Already connecting or connected, skipping...');
            return
        }

        isConnecting.current = true

        const wsUrl = `wss://collabsphere.azurewebsites.net/ws?whiteboardId=${whiteboardId}&pageId=${pageId}&drawerId=${drawerId}&userName=${encodeURIComponent(drawerName)}`;

        console.log('🔌 Connecting to WebSocket:', wsUrl);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket

        socket.onerror = (err) => {
            console.error('❌ WebSocket Error:', err);
            isConnecting.current = false
        };

        socket.onclose = (e) => {
            console.log('🔴 WebSocket Closed:', e.code, e.reason);
            isConnecting.current = false

            // Cleanup
            if (batcherRef.current) {
                batcherRef.current.destroy();
                batcherRef.current = null;
            }
            if (presenceRef.current) {
                presenceRef.current.destroy();
                presenceRef.current = null;
            }

            // Auto-reconnect on abnormal closure
            if (isMounted.current && e.code !== 1000 && e.code !== 1001) {
                console.log('🔄 Attempting to reconnect in 2 seconds...');
                reconnectTimeoutRef.current = window.setTimeout(() => {
                    if (isMounted.current && socketRef.current === socket) {
                        socketRef.current = null;
                        console.log('🔄 Reconnecting...');
                    }
                }, 2000);
            }
        };

        socket.onopen = () => {
            console.log(`✅ Connected to page: ${pageId} as ${drawerId} (${drawerName})`);
            isConnecting.current = false

            if (!editor) {
                console.error('❌ Editor is null after connection opened!');
                socket.close();
                return;
            }

            editor.updateInstanceState({
                cursor: { type: 'none', rotation: 0 },
            })

            // Clear old shapes when connecting
            const oldShapeIds = Array.from(editor.store.allRecords())
                .filter((r) => r.typeName === "shape")
                .map((r) => r.id);
            if (oldShapeIds.length) {
                editor.store.remove(oldShapeIds);
                console.log(`🗑️ Cleared ${oldShapeIds.length} old shapes`);
            }

            // ✅ Initialize optimized batcher
            batcherRef.current = new OptimizedRAFBatcher(socket, drawerId, pageId);

            // ✅ Initialize presence throttler
            presenceRef.current = new PresenceThrottler(socket, {
                userId: drawerId,
                userName: drawerName,
                pageId: pageId,
                whiteboardId: whiteboardId,
            });

            // ========== MESSAGE LISTENER ==========
            socket.onmessage = (event) => {
                try {
                    const messages = parseWebSocketMessage(event.data);

                    for (const msg of messages) {
                        try {
                            processMessage(msg);
                        } catch (msgErr) {
                            console.error('⚠️ Error processing message:', msgErr);
                        }
                    }
                } catch (err) {
                    console.error('⚠️ WebSocket handler error:', err)
                }
            }

            // ========== MESSAGE PROCESSOR ==========
            function processMessage(msg: any) {
                if (!editor) {
                    console.warn('⚠️ Editor is null, cannot process message');
                    return;
                }

                if (!msg || typeof msg !== 'object') {
                    return;
                }

                // 1. HANDLE NEW PAGE
                if (msg.type === 'new_page') {
                    console.log('📡 WebSocket: Received new_page', msg.page);
                    const tldrawPageId = `page:${msg.page.pageId}` as TLPageId;

                    if (!editor.store.get(tldrawPageId)) {
                        editor.store.put([{
                            id: tldrawPageId,
                            typeName: 'page',
                            name: msg.page.pageTitle,
                            index: `a${msg.page.pageId}` as IndexKey,
                            meta: {},
                        }]);
                        console.log(`✅ Added new page from WebSocket: ${msg.page.pageTitle}`);
                    }
                    return;
                }

                // 2. HANDLE PAGE RENAME
                if (msg.type === 'update_page') {
                    console.log('📡 WebSocket: Received update_page', msg.page);
                    const tldrawPageId = `page:${msg.page.pageId}` as TLRecord['id'];
                    const existingPage = editor.store.get(tldrawPageId);

                    if (existingPage && isPage(existingPage)) {
                        editor.store.put([{
                            ...existingPage,
                            name: msg.page.pageTitle,
                        }]);
                        console.log(`✅ Updated page title from WebSocket: ${msg.page.pageTitle}`);
                    }
                    return;
                }

                // 3. HANDLE PAGE DELETE
                if (msg.type === 'delete_page' && msg.page) {
                    console.log('📡 WebSocket: Received delete_page', msg.page);
                    const tldrawPageId = `page:${msg.page.pageId}` as TLRecord['id'];

                    const existing = editor.store.get(tldrawPageId);
                    if (existing) {
                        editor.store.remove([tldrawPageId]);
                        console.log(`✅ Removed page from WebSocket: ${tldrawPageId}`);
                    }

                    const myCurrent = editor.getCurrentPageId();
                    if (myCurrent === tldrawPageId) {
                        const ok = window.confirm(
                            "The page you are viewing was deleted by someone else. Click OK to reload."
                        );
                        if (ok) {
                            window.location.reload();
                        }
                    }
                    return;
                }

                const msgUserId = msg.userId?.toString();

                // 4. HANDLE SYNC (shapes/bindings) - OPTIMIZED
                if (msg.type === 'sync' && msg.payload) {
                    if (msgUserId && msgUserId !== drawerId) {
                        // Use mergeRemoteChanges for better performance
                        editor.store.mergeRemoteChanges(() => {
                            const { added, updated, removed } = msg.payload;

                            // Batch all operations
                            const toAdd: TLRecord[] = [];
                            const toRemove: TLRecord['id'][] = [];

                            if (added) {
                                toAdd.push(...Object.values(added) as TLRecord[]);
                            }
                            if (updated) {
                                toAdd.push(...Object.values(updated).map((u: any) => u[1]) as TLRecord[]);
                            }
                            if (removed) {
                                toRemove.push(...Object.values(removed).map((r: any) => r.id) as TLRecord['id'][]);
                            }

                            // Apply in one batch
                            if (toAdd.length) editor.store.put(toAdd);
                            if (toRemove.length) editor.store.remove(toRemove);

                            const total = toAdd.length + toRemove.length;
                            if (total > 0) {
                                console.log(`📥 Received ${total} changes from ${msgUserId}`);
                            }
                        })
                    }
                    else if (!msgUserId) {
                        editor.store.mergeRemoteChanges(() => {
                            const { added } = msg.payload
                            if (added) editor.store.put(Object.values(added) as TLRecord[])
                        })
                    }
                    return;
                }

                // 5. HANDLE PRESENCE (cursor)
                if (msg.type === 'presence' && msgUserId && msgUserId !== drawerId) {
                    if (typeof msg.x !== 'number' || typeof msg.y !== 'number') {
                        return;
                    }

                    if (!msg.camera || typeof msg.camera.x !== 'number') {
                        return;
                    }

                    const presenceId = `instance_presence:${msgUserId}` as TLInstancePresenceID
                    const presence: TLInstancePresence = {
                        id: presenceId,
                        typeName: 'instance_presence',
                        userId: msgUserId,
                        userName: msg.userName ?? msgUserId,
                        lastActivityTimestamp: Date.now(),
                        camera: {
                            x: msg.camera.x,
                            y: msg.camera.y,
                            z: msg.camera.z || 1
                        },
                        cursor: {
                            x: msg.x,
                            y: msg.y,
                            type: 'pointer',
                            rotation: 0
                        },
                        color: msg.color ?? '#1E90FF',
                        currentPageId: editor.getCurrentPageId(),
                        followingUserId: null,
                        selectedShapeIds: [],
                        brush: null,
                        scribbles: [],
                        screenBounds: { x: 0, y: 0, w: 1, h: 1 },
                        meta: {},
                        chatMessage: '',
                    }
                    editor.store.put([presence]);
                    return;
                }

                // 6. HANDLE USER LEAVE
                if (msg.type === 'leave' && msgUserId && msgUserId !== drawerId) {
                    console.log(`👋 ${msg.userName} (ID: ${msgUserId}) left the room.`);
                    const presenceId = `instance_presence:${msgUserId}` as TLInstancePresenceID
                    editor.store.remove([presenceId])
                    return;
                }
            }

            // ========== 🚀 OPTIMIZED STORE LISTENER ==========
            const cleanupStoreListener = editor.store.listen(
                (update) => {
                    if (update.source !== 'user') return;

                    const { changes } = update;
                    const batcher = batcherRef.current;
                    if (!batcher) return;

                    // Process all changes and add to RAF batch
                    for (const [id, record] of Object.entries(changes.added)) {
                        if (record.typeName === 'shape' || record.typeName === 'binding') {
                            batcher.addChange('added', id, record);
                        }
                    }

                    for (const [id, [from, to]] of Object.entries(changes.updated)) {
                        if (to.typeName === 'shape' || to.typeName === 'binding') {
                            batcher.addChange('updated', id, to, from);
                        }
                    }

                    for (const [id, record] of Object.entries(changes.removed)) {
                        if (record.typeName === 'shape' || record.typeName === 'binding') {
                            batcher.addChange('removed', id, record);
                        }
                    }
                },
                { source: 'user' }
            );

            // ========== 🚀 OPTIMIZED POINTER MOVE LISTENER ==========
            const handlePointerMove = () => {
                if (!editor || !presenceRef.current) return;

                const point = editor.inputs.currentPagePoint;
                const camera = editor.getCamera();

                presenceRef.current.update(point.x, point.y, camera);
            }

            window.addEventListener('pointermove', handlePointerMove);

            // ========== CLEANUP ==========
            socket.onclose = () => {
                console.warn(`🔻 Disconnected from page: ${pageId}`);

                // Destroy batcher and throttler
                if (batcherRef.current) {
                    batcherRef.current.destroy();
                    batcherRef.current = null;
                }
                if (presenceRef.current) {
                    presenceRef.current.destroy();
                    presenceRef.current = null;
                }

                cleanupStoreListener();
                window.removeEventListener('pointermove', handlePointerMove);

                if (socketRef.current === socket) {
                    socketRef.current = null;
                }
            };
        }

        socket.onerror = (err) => {
            console.error('⚠️ Socket error:', err)
            isConnecting.current = false
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        }

        // Main cleanup function
        return () => {
            console.log('🧹 Cleaning up WebSocket connection');
            isMounted.current = false

            // Destroy batcher and throttler
            if (batcherRef.current) {
                batcherRef.current.destroy();
                batcherRef.current = null;
            }
            if (presenceRef.current) {
                presenceRef.current.destroy();
                presenceRef.current = null;
            }

            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                try {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'leave',
                            drawerId: drawerId.toString(),
                            pageId
                        }));
                    }
                    socket.close(1000, 'Component unmounting');
                } catch (err) {
                    console.error('❌ Failed to send leave/close:', err);
                }
            }

            if (socketRef.current === socket) {
                socketRef.current = null;
            }

            isConnecting.current = false
        }
    }, [editor, whiteboardId, pageId, drawerId, drawerName])

    return socketRef.current;
}