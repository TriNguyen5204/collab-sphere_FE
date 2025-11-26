import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ socket, roomId, myName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const hasRequestedHistory = useRef(false);

  // 📜 YÊU CẦU LỊCH SỬ CHAT KHI MỞ CHAT BOX
  useEffect(() => {
    if (!socket || !roomId || hasRequestedHistory.current) return;

    console.log('📜 Requesting chat history for room:', roomId);
    
    // Yêu cầu lịch sử chat từ server
    socket.emit('requestChatHistory', roomId);
    hasRequestedHistory.current = true;

    // Lắng nghe lịch sử chat
    const handleChatHistory = (history) => {
      console.log('✅ Received chat history:', history.length, 'messages');
      setMessages(history);
      setIsLoadingHistory(false);
    };

    socket.on('chatHistory', handleChatHistory);

    return () => {
      socket.off('chatHistory', handleChatHistory);
    };
  }, [socket, roomId]);

  // 💬 LẮNG NGHE TIN NHẮN MỚI (REALTIME)
  useEffect(() => {
    if (!socket) return;

    const handleMessage = msg => {
      console.log('💬 New message received:', msg);
      
      // Kiểm tra xem tin nhắn đã có trong danh sách chưa (tránh duplicate)
      setMessages(prev => {
        // Nếu tin nhắn đã tồn tại (cùng timestamp và sender), không thêm nữa
        const isDuplicate = prev.some(
          m => m.timestamp === msg.timestamp && m.sender === msg.sender && m.message === msg.message
        );
        
        if (isDuplicate) {
          return prev;
        }
        
        return [...prev, msg];
      });
    };

    socket.on('chatMessage', handleMessage);

    return () => {
      socket.off('chatMessage', handleMessage);
    };
  }, [socket]);

  // 📜 TỰ ĐỘNG SCROLL XUỐNG KHI CÓ TIN NHẮN MỚI
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
    });
    
    setChatInput("");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Google Meet Style */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">In-call messages</h3>
            {messages.length > 0 && (
              <p className="text-xs text-gray-500">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Close chat"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50">
        {/* Loading State */}
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">Messages can only be seen by people in the call</p>
            <p className="text-sm text-gray-500">and are deleted when the call ends.</p>
          </div>
        ) : (
          // Messages List
          messages.map((msg, idx) => {
            const isMe = msg.sender === myName;
            const showTimestamp = msg.timestamp;
            
            return (
              <div key={`${msg.timestamp}-${idx}`} className="animate-fade-in">
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender Name */}
                    {!isMe && (
                      <span className="text-xs font-semibold text-gray-700 mb-1.5 px-1">
                        {msg.sender}
                      </span>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`group relative px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? 'bg-[#1a73e8] text-white rounded-br-sm' 
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                      
                      {/* Timestamp on hover */}
                      {showTimestamp && (
                        <span className={`absolute -bottom-5 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isMe ? 'right-0' : 'left-0'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Google Meet Style */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
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
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px'
              }}
              disabled={isLoadingHistory}
            />
          </div>
          
          <button
            type="submit"
            disabled={!chatInput.trim() || isLoadingHistory}
            className="p-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-all flex-shrink-0 shadow-lg hover:shadow-xl disabled:shadow-none"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to send • 
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono ml-1">Shift+Enter</kbd> for new line
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
          animation: fade-in 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Auto-resize textarea */
        textarea {
          field-sizing: content;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;