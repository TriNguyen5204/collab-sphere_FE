import * as signalr from "@microsoft/signalr";

// Server Available Commands
export const ServerCommands = {
    JOIN_SERVER: "JoinServer",
    MILESTONE_CREATE: "BroadcastMilestoneCreated",
    MILESTONE_UPDATE: "BroadcastMilestoneUpdated",
    MILESTONE_DELETE: "BroadcastMilestoneDeleted",
    MILESTONE_CHECK_DONE: "BroadcastMilestoneCheckedDone",
    MILESTONE_EVALUATE: "BroadcastMilestoneEvaluated",
};

// Connection Retrieval Handlers
export const EventHandlers = {
    MILESTONE_CREATE: "ReceiveMilestoneCreated",
    MILESTONE_UPDATE: "ReceiveMilestoneUpdated",
    MILESTONE_DELETE: "ReceiveMilestoneDeleted",
    MILESTONE_CHECK_DONE: "ReceiveMilestoneCheckedDone",
    MILESTONE_EVALUATE: "ReceiveMilestoneEvaluated",

    NOTIFICATION: "ReceiveNotification",
    NOTIFICATION_HISTORY: "ReceiveNotificationHistory",
};

class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        this.listeners.set(event, [...(this.listeners.get(event) || []), callback]);
    }

    off(event, callback) {
        this.listeners.set(event, (this.listeners.get(event) || []).filter(cb => cb !== callback));
    }

    emit(event, ...args) {
        (this.listeners.get(event) || []).forEach(cb => cb(...args));
    }
}

export class TeamBoardService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.eventEmitter = new EventEmitter();
        this.connection = null;
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        // Remove trailing slash if present
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // If it ends with /api, remove it
        const rootUrl = cleanBase.endsWith('/api') ? cleanBase.slice(0, -4) : cleanBase;
        const hubUrl = `${rootUrl}/team-board-hub`;

        this.connection = new signalr.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => this.accessToken,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalr.LogLevel.Information)
            .build();

        this._bindServerEvents();
    }

    _bindServerEvents() {
        Object.values(EventHandlers).forEach(event => {
            this.connection.on(event, (payload) => {
                console.log(`[SignalR] Received ${event}:`, payload);
                this.eventEmitter.emit(event, payload);
            });
        });
    }

    async joinServer() {
        if (this.connection.state === signalr.HubConnectionState.Connected) {
            return;
        }
        try {
            await this.connection.start();
            console.log("Team Board SignalR connected.");
            await this.connection.invoke(ServerCommands.JOIN_SERVER);
        } catch (err) {
            console.error("SignalR connection failed: ", err);
        }
    }

    async disconnect() {
        try {
            await this.connection.stop();
            console.log("Team Board SignalR disconnected.");
        } catch (err) {
            console.error("SignalR disconnection failed: ", err);
        }
    }

    // Event Subscription Methods
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }

    // Broadcast Methods
    async broadcastMilestoneCreate(teamId, teamMilestoneId, linkForTeamMember = "") {
        return this._invoke(ServerCommands.MILESTONE_CREATE, Number(teamId), Number(teamMilestoneId), linkForTeamMember);
    }

    async broadcastMilestoneUpdate(teamId, teamMilestoneId, linkForTeamMember = "") {
        return this._invoke(ServerCommands.MILESTONE_UPDATE, Number(teamId), Number(teamMilestoneId), linkForTeamMember);
    }

    async broadcastMilestoneDelete(teamId, teamMilestoneId, linkForTeamMember = "") {
        return this._invoke(ServerCommands.MILESTONE_DELETE, Number(teamId), Number(teamMilestoneId), linkForTeamMember);
    }

    async broadcastMilestoneCheckDone(teamId, teamMilestoneId, linkForTeamMember = "", linkForLecturer = "") {
        return this._invoke(ServerCommands.MILESTONE_CHECK_DONE, Number(teamId), Number(teamMilestoneId), linkForTeamMember, linkForLecturer);
    }

    async broadcastMilestoneEvaluated(teamId, teamMilestoneId, linkForTeamMember = "") {
        return this._invoke(ServerCommands.MILESTONE_EVALUATE, Number(teamId), Number(teamMilestoneId), linkForTeamMember);
    }

    async _invoke(methodName, ...args) {
        try {
            if (this.connection.state !== signalr.HubConnectionState.Connected) {
                console.warn(`Cannot invoke ${methodName}: SignalR not connected.`);
                return;
            }
            await this.connection.invoke(methodName, ...args);
        } catch (err) {
            console.error(`Failed to invoke ${methodName}:`, err);
            throw err;
        }
    }
}
