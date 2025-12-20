import { useEffect, useRef, useCallback, useState } from 'react'
import type {
    Editor,
    TLRecord,
    TLInstancePresence,
    TLInstancePresenceID,
    TLPageId,
    TLPage,
    IndexKey,
} from 'tldraw'
import useToastConfirmation from '../../../hooks/useToastConfirmation';

// Helper type guard
function isPage(record: TLRecord): record is TLPage {
    return record.typeName === 'page'
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
    private minSendInterval: number = 8;

    private drawingTimer: number | null = null;
    private drawingCompleteDelay: number = 15;
    private isDrawing: boolean = false;

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
        this.isDrawing = true;
        this.resetDrawingTimer();
        // Schedule flush
        this.scheduleFlush();
    }
    private resetDrawingTimer() {
        if (this.drawingTimer !== null) {
            clearTimeout(this.drawingTimer);
        }

        // Set a timer to detect when drawing is complete
        this.drawingTimer = window.setTimeout(() => {
            if (this.isDrawing) {
                console.log('✅ Drawing completed, forcing flush...');
                this.isDrawing = false;
                this.forceFlush(); // Force flush when drawing completes
            }
        }, this.drawingCompleteDelay);
    }

    private scheduleFlush() {
        if (this.rafId !== null) return;

        this.rafId = requestAnimationFrame(() => {
            this.flush();
        });
    }
    private forceFlush() {
        // Cancel any pending RAF
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Immediately flush all pending changes
        this.flush(true);
    }

    flush(force: boolean = false) {
        this.rafId = null;

        const now = performance.now();
        const timeSinceLastSend = now - this.lastSendTime;

        // Throttle: Don't send more than 60 times per second
        if (!force && timeSinceLastSend < this.minSendInterval) {
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
        // console.log('🚀 SENDING BATCH TO SERVER:', JSON.stringify(payload, null, 2));

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
                const marker = force ? '🔥 FORCE' : '⚡';
                console.log(`${marker} Batched ${total} changes in one message`);
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
        if (this.drawingTimer !== null) {
            clearTimeout(this.drawingTimer);
            this.drawingTimer = null;
        }

        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        // Send final batch
        this.flush(true);
    }
}

/**
 *  OPTIMIZED: Presence (cursor) throttling
 */
class PresenceThrottler {
    private lastPosition: { x: number, y: number, camera: any } | null = null;
    private lastSendTime: number = 0;
    private throttleInterval: number = 16;  //thời gian tối thiểu giữ 2 lần gửi tin
    private timeoutId: number | null = null; //id bộ đếm giở để quản lý việc gửi trễ 
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
    const confirmWithToast = useToastConfirmation();
    const socketRef = useRef<WebSocket | null>(null)
    const [activeSocket, setActiveSocket] = useState<WebSocket | null>(null);
    const batcherRef = useRef<OptimizedRAFBatcher | null>(null)
    const presenceRef = useRef<PresenceThrottler | null>(null)
    const msgBufferRef = useRef<string>(''); //bộ đệm string dùng để xử lý hiện tượng dính gói tin
    const isConnecting = useRef(false)
    const isMounted = useRef(true)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const cleanupFunctionsRef = useRef<Array<() => void>>([])
    const pingIntervalRef = useRef<number | null>(null);

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
            cleanupFunctionsRef.current.forEach(cleanup => cleanup())
            cleanupFunctionsRef.current = []

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
            // ✅ 1. CONFIRMATION & STATE UPDATE
            // Xác nhận kết nối thành công và cập nhật trạng thái UI
            console.log(`✅ Connected to page: ${pageId} as ${drawerId} (${drawerName})`);
            isConnecting.current = false
            if (isMounted.current) setActiveSocket(socket);

            // 🛑 2. FAIL-FAST SAFETY CHECK
            // Nếu editor chưa sẵn sàng (null) thì kết nối cũng vô nghĩa -> Đóng ngay để tiết kiệm tài nguyên.
            if (!editor) {
                console.error('❌ Editor is null after connection opened!');
                socket.close();
                return;
            }

            // 🧹 3. CLEAN SLATE PROTOCOL (QUAN TRỌNG)
            // Xóa toàn bộ hình vẽ cũ đang có ở Local trước khi đồng bộ.
            // Lý do: Tránh xung đột ID (Duplicate ID conflict) hoặc hiển thị dữ liệu rác (Stale Data)
            // khi Server chuẩn bị gửi về bộ dữ liệu mới nhất (Snapshot).
            const oldShapeIds = Array.from(editor.store.allRecords())
                .filter((r) => r.typeName === "shape")
                .map((r) => r.id);
            if (oldShapeIds.length) {
                editor.store.remove(oldShapeIds);
                console.log(`🗑️ Cleared ${oldShapeIds.length} old shapes to prepare for sync`);
            }

            // 🚀 4. INITIALIZE OPTIMIZERS (Bộ máy tối ưu hiệu năng)
            // Khởi tạo Batcher: Gom nhóm các nét vẽ (Drawings) để gửi theo Frame (RAF).
            batcherRef.current = new OptimizedRAFBatcher(socket, drawerId, pageId);

            // Khởi tạo Throttler: Tiết lưu tần suất gửi vị trí con trỏ (Cursor) ~60ms/lần.
            presenceRef.current = new PresenceThrottler(socket, {
                userId: drawerId,
                userName: drawerName,
                pageId: pageId,
                whiteboardId: whiteboardId,
            });

            // 💓 5. KEEP-ALIVE MECHANISM (HEARTBEAT)
            // Ping Server mỗi 30s để giữ kết nối luôn mở.
            // Ngăn chặn việc Load Balancer (Azure/AWS/Nginx) tự động đóng kết nối nhàn rỗi (Idle Timeout).
            pingIntervalRef.current = window.setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    try {
                        socket.send(JSON.stringify({ type: 'ping' }));
                        // console.log('💓 Ping sent');
                    } catch (e) {
                        console.error('Failed to send ping');
                    }
                }
            }, 30000);

            // ========== MESSAGE LISTENER ==========
            socket.onmessage = async (event) => {
                try {
                    // 1. Cộng dồn data mới vào buffer
                    msgBufferRef.current += event.data;

                    const messages: any[] = [];
                    let remaining = msgBufferRef.current;

                    // 2. Vòng lặp quét tìm các JSON hoàn chỉnh
                    while (true) {
                        const start = remaining.indexOf('{');
                        if (start === -1) {
                            if (remaining.trim() !== '') remaining = '';
                            break;
                        }

                        let depth = 0;
                        let end = -1;

                        for (let i = start; i < remaining.length; i++) {
                            if (remaining[i] === '{') depth++;
                            else if (remaining[i] === '}') {
                                depth--;
                                if (depth === 0) {
                                    end = i;
                                    break;
                                }
                            }
                        }

                        if (end !== -1) {
                            const jsonStr = remaining.substring(start, end + 1);
                            try {
                                const parsed = JSON.parse(jsonStr);
                                messages.push(parsed);
                                remaining = remaining.substring(end + 1);
                            } catch (parseErr) {
                                console.error('❌ Parse error chunk, skipping char:', parseErr);
                                remaining = remaining.substring(start + 1);
                            }
                        } else {
                            break;
                        }
                    }

                    // 3. Cập nhật lại buffer
                    msgBufferRef.current = remaining;

                    // 4. Xử lý messages
                    for (const msg of messages) {
                        try {
                            await processMessage(msg);
                        } catch (err) {
                            console.error("Error processing message:", err, msg);
                        }
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            // ========== MESSAGE PROCESSOR ==========
            async function processMessage(msg: any) {
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
                    const pageIndex = `a${String(msg.page.pageId).padStart(6, '0')}` as IndexKey;

                    if (!editor.store.get(tldrawPageId)) {
                        editor.store.put([{
                            id: tldrawPageId,
                            typeName: 'page',
                            name: msg.page.pageTitle,
                            index: pageIndex,
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
                        const ok = await confirmWithToast(
                            "The page you are viewing was deleted by someone else. Click Confirm to reload.",
                            {
                                description: "This action cannot be undone.",
                                confirmText: "Reload",
                                cancelText: "Stay",
                                dismissible: false,
                            }
                        );
                        if (ok) {
                            window.location.reload();
                        }
                    }
                    return;
                }

                const msgUserId = msg.userId?.toString();

                // 4. HANDLE SYNC (shapes/bindings) - ĐÃ SỬA TYPE & LOGIC MERGE
                if (msg.type === 'sync' && msg.payload) {
                    editor.store.mergeRemoteChanges(() => {
                        const { added, updated, removed } = msg.payload;

                        // Map lưu trữ bản ghi chuẩn nhất (đã gộp)
                        const recordsMap = new Map<string, TLRecord>();
                        // Set lưu ID cần xóa (được ép kiểu đúng)
                        const idsToRemove = new Set<TLRecord['id']>();

                        // 1. Xử lý REMOVED
                        if (removed) {
                            Object.values(removed).forEach((r: any) => {
                                if (r && r.id) idsToRemove.add(r.id as TLRecord['id']);
                            });
                        }

                        // 2. Xử lý ADDED (Gốc)
                        if (added) {
                            Object.values(added).forEach((r: any) => {
                                recordsMap.set(r.id, r as TLRecord);
                                // Nếu ID này từng bị đánh dấu xóa thì bỏ đánh dấu
                                idsToRemove.delete(r.id as TLRecord['id']);
                            });
                        }

                        // 3. Xử lý UPDATED (Quan trọng: GỘP vào ADDED thay vì ghi đè)
                        if (updated) {
                            Object.values(updated).forEach((u: any) => {
                                let updateRec: TLRecord | null = null;

                                if (Array.isArray(u) && u.length === 2) {
                                    updateRec = u[1] as TLRecord;
                                } else {
                                    updateRec = u as TLRecord;
                                }

                                if (updateRec && updateRec.id) {
                                    const existing = recordsMap.get(updateRec.id);
                                    if (existing) {
                                        // 🌟 LOGIC MERGE QUAN TRỌNG:
                                        // Nếu đã có bản ghi (từ added), hãy gộp update mới vào nó
                                        // thay vì thay thế hoàn toàn (để tránh mất prop geo, type...)
                                        recordsMap.set(updateRec.id, {
                                            ...existing,
                                            ...updateRec,
                                            props: { ...existing.props, ...(updateRec.props || {}) },
                                            meta: { ...existing.meta, ...(updateRec.meta || {}) }
                                        });
                                    } else {
                                        // Nếu chưa có, đây có thể là update rời rạc, cứ lưu vào
                                        recordsMap.set(updateRec.id, updateRec);
                                    }

                                    idsToRemove.delete(updateRec.id as TLRecord['id']);
                                }
                            });
                        }

                        // 4. Thực thi update store
                        const toPut = Array.from(recordsMap.values());
                        const toRemove = Array.from(idsToRemove); // Đã đúng kiểu TLRecord['id'][]

                        if (toRemove.length > 0) {
                            // TypeScript sẽ không báo lỗi nữa vì toRemove đã đúng kiểu
                            editor.store.remove(toRemove);
                        }

                        if (toPut.length > 0) {
                            editor.store.put(toPut);
                        }

                        const total = toPut.length + toRemove.length;
                        if (total > 0) {
                            console.log(`📥 Processed ${total} changes (Merged & Typed)`);
                        }
                    });
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

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }
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
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }

            isConnecting.current = false
        }
    }, [editor, whiteboardId, pageId, drawerId, drawerName])

    return activeSocket;
}