import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, roomId, myName }) => {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = msg => setMessages(prev => [...prev, msg]);
    socket.on('chatMessage', handleMessage);
    return () => socket.off('chatMessage', handleMessage);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = e => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('chatMessage', { roomId, sender: myName, message: chatInput });
    setChatInput("");
  };

  return (
    <div className="fixed right-4 top-18 z-50 flex flex-col w-96 h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-700 border-b text-center">
        Nhắn tin trong cuộc họp
      </div>
      {/* Messages list */}
      <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === myName ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg bg-blue-50 text-gray-900 shadow ${
              msg.sender === myName ? "bg-blue-100" : "bg-gray-50"
            }`}>
              <span className={`font-bold ${msg.sender === myName ? "text-blue-600" : "text-gray-600"}`}>
                {msg.sender}:
              </span>
              <span className="ml-1">{msg.message}</span>
              <span className="text-xs text-gray-400 ml-2 select-none">
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input box */}
      <form onSubmit={sendMessage} className="flex items-center border-t bg-gray-50 px-3 py-3">
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-800"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
