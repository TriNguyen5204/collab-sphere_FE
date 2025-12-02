// src/SignalRYjsProvider.js
import * as Y from "yjs"
import {
    Awareness,
    encodeAwarenessUpdate,
    applyAwarenessUpdate,
} from "y-protocols/awareness"
import * as signalr from "@microsoft/signalr"

// 🎨 Predefined cursor colors
const palette = [
    "#FF5722", // deep orange
    "#E91E63", // pink
    "#9C27B0", // purple
    "#3F51B5", // indigo
    "#2196F3", // blue
    "#009688", // teal
    "#4CAF50", // green
    "#CDDC39", // lime
    "#FFC107", // amber
    "#FF9800", // orange
    "#795548", // brown
    "#607D8B", // blue grey
];

const usedColors = new Set();

function getUniqueColor() {
    const available = palette.filter(c => !usedColors.has(c));

    // if all used, reset (or allow repeats)
    if (available.length === 0) {
        usedColors.clear();
        return getUniqueColor();
    }

    const color = available[Math.floor(Math.random() * available.length)];
    usedColors.add(color);
    return color;
}

export class SignalRYjsProvider {
    constructor(teamId, room, doc, userId, userName = "Anonymous", accessToken) {
        this.doc = doc
        this.room = room
        this.teamId = teamId
        this.userId = userId
        this.userName = userName
        this.userColor = getUniqueColor()
        this.accessToken = accessToken
        this.awareness = new Awareness(this.doc)

        // Setup SignalR connection
        this.connection = new signalr.HubConnectionBuilder()
            .withUrl("https://collabsphere.azurewebsites.net/yhub",
                {
                    accessTokenFactory: () => this.accessToken ?? "",
                }
            )
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalr.LogLevel.Information)
            .build()

        this.connection.onreconnecting(() => console.log("Reconnecting..."));
        this.connection.onreconnected(async () => {
            console.log("Reconnected successfully!");
            try {
                await this.startSync();
                console.log("Re-sync completed.");
            } catch (error) {
                console.error("Failed to re-sync after reconnect:", error);
            }
        });

        this.connection.onclose(() => console.log("Connection closed."));

        // BIND HUB LISTENERS ONCE IN CONSTRUCTOR
        this.BindServerCalls();
        this.BindLocalDocEvents();
    }

    BindServerCalls() {
        // --- Receive document updates from server
        this.connection.on("ReceiveUpdate", (updateBase64) => {
            const update = this.decodeBase64(updateBase64)
            Y.applyUpdate(this.doc, update, this)
        })

        // --- Receive awareness updates from server
        this.connection.on("ReceiveAwareness", (updateBase64) => {
            const update = this.decodeBase64(updateBase64)
            applyAwarenessUpdate(this.awareness, update, 'local')
        })

        // Initialize doc state when joining
        this.connection.on("ReceiveDocState", (updateBase64s) => {
            updateBase64s.forEach(updateBase64 => {
                const update = this.decodeBase64(updateBase64)
                Y.applyUpdate(this.doc, update, this)
            })

            console.log(`Document initialized with ${updateBase64s.length} past updates.`);

            if (updateBase64s.length >= 120) {
                const snapshotBase64 = this.getSnapshotBase64();
                void this.connection.invoke("SendMergedSnapshot", this.teamId, this.room, snapshotBase64)
            }
        })

        this.connection.on("UserDisconnected", (exitedUserId) => {
            console.log("User Left: ", exitedUserId);
            console.log("Before find: ", Array.from(this.awareness.getStates().entries()));

            const client = Array.from(this.awareness.getStates().entries())
                .find(([_clientID, state]) => state.user.userId == exitedUserId);

            console.log("After find: ", client);

            if (client) {
                const clientIDToRemove = client[0];
                const deleteSuccess = this.awareness.states.delete(clientIDToRemove)
                console.log("Delete success: ", deleteSuccess);
                console.log("After delete: ", Array.from(this.awareness.getStates().entries()));

                this.awareness.emit('update', [{
                    added: [],
                    updated: [],
                    removed: [clientIDToRemove]
                }, 'local']);
            }
        });
    }

    handleDocUpdate = (update, origin) => {
        try {
            if (origin === this) return

            const base64 = this.encodeBase64(update)
            this.connection.invoke("BroadcastUpdate", this.teamId, this.room, base64);
        } catch (err) {
            console.error("Error invoking Hub method:", err);
        }
    }

    handleAwarenessUpdate = debounce(
        (_changes, _origin) => {
            if (this.connection.state !== signalr.HubConnectionState.Connected) {
                return;
            }

            if (_origin !== 'local') {
                return;
            }

            const update = encodeAwarenessUpdate(this.awareness, [this.awareness.clientID])
            const base64 = this.encodeBase64(update)
            void this.connection.invoke("BroadcastAwareness", this.teamId, this.room, base64)
        },
        120
    );

    BindLocalDocEvents() {
        this.doc.off("update", this.handleDocUpdate)
        this.awareness.off("update", this.handleAwarenessUpdate)

        this.doc.on("update", this.handleDocUpdate)
        this.awareness.on("update", this.handleAwarenessUpdate)
    }

    async startSync() {
        await this.connection.invoke("JoinDocument", this.teamId, this.room);
    }

    async connect() {
        console.log("Connect to SignalR with token:", this.accessToken)
        await this.connection.start().then(async () => {
            console.log("SignalR connected:", this.connection.state)

            try {
                await this.startSync();
                console.log("Sync completed.");
            } catch (error) {
                console.error("Failed to sync after connect:", error);
            }
        }).catch((err) => {
            console.error("SignalR connection error:", err);
        })
    }

    async disconnect() {
        this.awareness.setLocalState(null);

        if (this.connection.state === signalr.HubConnectionState.Connected) {
            await this.connection.invoke("LeaveDocument", this.teamId, this.room);
        }

        await this.connection.stop();

        this.doc.off("update", this.handleDocUpdate)
        this.awareness.off("update", this.handleAwarenessUpdate)
    }

    initCursor() {
        if (this.connection.state !== signalr.HubConnectionState.Connected) {
            console.error("SignalR is not connected, cannot init cursor");
            return;
        }

        const user = {
            userId: this.userId || -1,
            name: this.userName,
            color: this.userColor
        }

        const initState = {
            user: user,
            cursor: { from: 1, to: 1 }
        };

        this.awareness.setLocalState(initState)
        console.log("Cursor initialized for user:", this.awareness.getLocalState());
    }

    setCursor(from, to) {
        const current = this.awareness.getLocalState()
        const state = {
            user: current?.user || { name: this.userName, color: this.userColor, userId: this.userId || -1 },
            cursor: { from, to },
        }

        this.awareness.setLocalState(state)
    }

    clearCursor() {
        const current = this.awareness.getLocalState()
        this.awareness.setLocalState({
            user: current?.user || { name: this.userName, color: this.userColor, userId: this.userId || -1 },
            cursor: null,
        })
    }

    encodeBase64(data) {
        let binary = ""
        for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i])
        return btoa(binary)
    }

    decodeBase64(base64) {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return bytes
    }

    getSnapshot() {
        return Y.encodeStateAsUpdate(this.doc);
    }

    getSnapshotBase64() {
        const snapshot = this.getSnapshot();
        return this.encodeBase64(snapshot);
    }
}

function debounce(fn, delay) {
    let timer = null;

    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}