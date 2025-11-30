import * as signalr from "@microsoft/signalr";

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

    getFunctions(event) {
        return this.listeners.get(event) || [];
    }
}

const JoinChatConversation = "JoinChatConversation";
const LoadChatConversationHistory = "LoadChatConversationHistory";
const BroadCastMessage = "BroadCastMessage";
const BroadcastMessageReadUpdate = "BroadcastReadUpdate";

export class SignalRChatProvider {
    constructor(conversationIds, accessToken = "") {
        this.conversationIds = conversationIds;
        this.accessToken = accessToken;
        this.eventEmitter = new EventEmitter();

        this.connection = new signalr.HubConnectionBuilder()
            .withUrl("https://collabsphere.azurewebsites.net/chathub", {
                accessTokenFactory: () => this.accessToken,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalr.LogLevel.Information)
            .build();

        // Register server-to-client listeners
        this.BindServerCalls();
    }

    /**
     * Registers all listeners for events from the server.
     */
    BindServerCalls() {
        // Fired when a new message is received in the team
        this.connection.on("ReceiveMessage", (message) => {
            this.eventEmitter.emit("messageReceived", message);
        });

        // Fired when you first join, gives you recent messages
        this.connection.on("ReceiveHistory", (messages) => {
            this.eventEmitter.emit("historyReceived", messages);
        });

        // Fired when a notification is received
        this.connection.on("ReceiveNotification", (notification) => {
            this.eventEmitter.emit("notiReceived", notification);
        });

        // Fired when you first join, gives you recent notifications
        this.connection.on("ReceiveAllNotification", (notifications) => {
            this.eventEmitter.emit("notiHistoryReceived", notifications);
        });

        // Fired when a user read a new message
        this.connection.on("ReceiveMessageReadUpdate", (userId, conversationId, readMessageId) => {
            console.log("Received message read: ", { userId, conversationId, readMessageId });
            this.eventEmitter.emit("userReadMessage", userId, conversationId, readMessageId);
        });

        // Fired when another user joins the team chat
        this.connection.on("UserJoined", (userId) => {
            this.eventEmitter.emit("userJoined", userId);
        });

        // Fired when another user leaves the team chat
        this.connection.on("UserLeft", (userId) => {
            this.eventEmitter.emit("userLeft", userId);
        });
    }

    /**
     * Connects to the hub and joins the team's chat group.
     */
    async connect() {
        try {
            await this.connection.start();
            console.log("Chat provider connected.");

            // Tell the server we want to join this team's chat
            await this.connection.invoke(JoinChatConversation, this.conversationIds);
        } catch (err) {
            console.error("Chat connection failed: ", err);
        }
    }

    /**
     * Load entire chat history of a conversation
     */
    async getChatConversationHistory(conversationId) {
        await this.connection.invoke(LoadChatConversationHistory, conversationId);
    }

    async broadcastMessageReadUpdate(conversationId, readMessageId) {
        await this.connection.invoke(BroadcastMessageReadUpdate, conversationId, readMessageId);
    }

    /**
     * Leaves the team's chat group and disconnects from the hub.
     */
    async disconnect() {
        try {
            await this.connection.stop();
        } catch (err) {
            console.error("Chat disconnection failed: ", err);
        }
    }

    /**
     * Sends a new chat message to the server.
     * @param {number} conversationId - The conversation ID
     * @param {string} content - The text content of the message.
     */
    async sendMessage(conversationId, content) {
        if (this.connection.state !== signalr.HubConnectionState.Connected) {
            console.error("Cannot send message, not connected.");
            return;
        }

        try {
            // The server will get the senderId/Name from the context.
            await this.connection.invoke(BroadCastMessage, conversationId, content);
        } catch (err) {
            console.error("Failed to send message: ", err);
        }
    }

    /**
     * Registers a callback for the "messageReceived" event.
     */
    onMessageReceied(callback) {
        const event = "messageReceived";
        this.eventEmitter.on(event, callback);
        console.log("Mounted a function for 'messageReceived': ", this.eventEmitter.getFunctions(event));
    }

    /**
     * Unregisters a callback for the "messageReceived" event.
     */
    offMessageReceived(callback) {
        const event = "messageReceived";
        this.eventEmitter.off(event, callback);
        console.log("Dismounted a function for 'messageReceived': ", this.eventEmitter.getFunctions(event));
    }

    /**
     * Registers a callback for the "historyReceived" event.
     */
    onReceiveHistory(callback) {
        const event = "historyReceived";
        this.eventEmitter.on(event, callback);
    }

    /**
     * Unregisters a callback for the "historyReceived" event.
     */
    offReceiveHistory(callback) {
        const event = "historyReceived";
        this.eventEmitter.off(event, callback);
    }

    /**
     * Registers a callback for the "userJoined" event.
     */
    onUserJoined(callback) {
        const event = "userJoined";
        this.eventEmitter.on(event, callback);
    }

    /**
     * Unregisters a callback for the "userJoined" event.
     */
    offUserJoined(callback) {
        const event = "userJoined";
        this.eventEmitter.off(event, callback);
    }

    /**
     * Registers a callback for the "userLeft" event.
     */
    onUserLeft(callback) {
        const event = "userLeft";
        this.eventEmitter.on(event, callback);
    }

    /**
     * Unregisters a callback for the "userLeft" event.
     */
    offUserLeft(callback) {
        const event = "userLeft";
        this.eventEmitter.off(event, callback);
    }

    /**
     * Registers a callback for the "notiReceived" event.
     */
    onNotiReceived(callback) {
        const event = "notiReceived";
        this.eventEmitter.on(event, callback);
    }

    /**
     * Unregisters a callback for the "notiReceived" event.
     */
    offNotiReceived(callback) {
        const event = "notiReceived";
        this.eventEmitter.off(event, callback);
    }

    /**
     * Registers a callback for the "notiHistoryReceived" event.
     */
    onNotiHistoryReceived(callback) {
        const event = "notiHistoryReceived";
        this.eventEmitter.on(event, callback);
    }

    /**
     * Unregisters a callback for the "notiHistoryReceived" event.
     */
    offNotiHistoryReceived(callback) {
        const event = "notiHistoryReceived";
        this.eventEmitter.off(event, callback);
    }

    onMessageReadUpdateReceived(callback) {
        const event = "userReadMessage";
        this.eventEmitter.on(event, callback);
        console.log("Mounted a function for 'userReadMessage': ", this.eventEmitter.getFunctions(event));
    }

    offMessageReadUpdateReceived(callback) {
        const event = "userReadMessage";
        this.eventEmitter.off(event, callback);
        console.log("Dismounted a function for 'userReadMessage': ", this.eventEmitter.getFunctions(event));
    }
}