import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, roomId, myName, onClose }) => {
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
    socket.emit('chatMessage', { 
      roomId, 
      sender: myName, 
      message: chatInput,
      timestamp: new Date().toISOString()
    });
    setChatInput("");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Google Meet Style */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="font-medium text-gray-900">Messages</h3>
          <span className="text-xs text-gray-500 ml-1">
            ({messages.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition"
          title="Close chat"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Send a message to everyone</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === myName;
            const showTimestamp = msg.timestamp;
            
            return (
              <div key={idx} className="animate-fade-in">
                {/* Message Bubble */}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender Name (only for others) */}
                    {!isMe && (
                      <span className="text-xs font-medium text-gray-600 mb-1 px-1">
                        {msg.sender}
                      </span>
                    )}
                    
                    {/* Message Content */}
                    <div className={`px-3 py-2 rounded-lg ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                    } shadow-sm`}>
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                    
                    {/* Timestamp */}
                    {showTimestamp && (
                      <span className="text-xs text-gray-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Google Meet Style */}
      <div className="border-t border-gray-200 bg-white p-3">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Send a message to everyone"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              rows={1}
              style={{
                minHeight: '36px',
                maxHeight: '100px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition flex-shrink-0"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-2 px-1">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;