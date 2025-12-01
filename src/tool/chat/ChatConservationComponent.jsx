import { SignalRChatProvider } from '../hooks/chat/SignalrChatProvider';
import NotificationBell from '../components/chat/NotificationBell.jsx';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ✅ THÊM useNavigate
import React from 'react';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

import * as ChatAPI from '../../services/chatApi';
import useTeam from '../../context/useTeam.js';

// Lucide React Icons
import {
  Send,
  MessageCircle,
  Users,
  Clock,
  Check,
  CheckCheck,
  Calendar,
  ArrowLeft, // ✅ THÊM icon Back
} from 'lucide-react';

export default function ChatComponent() {
  const [provider, setProvider] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { team } = useTeam();

  // Get accessToken from Redux store
  const accessToken = useSelector(state => state.user.accessToken);
  const userId = useSelector(state => state.user.userId);

  const navigate = useNavigate();
  // Chat Conversations
  const [chatConversations, setChatConversations] = useState([]);
  const [connectedConversationIds, setConnectedConversationIds] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(-1);
  const [currentConvDetail, setCurrentConvDetail] = useState(null);

  // Create refs for the message list DOM element
  const messageListRef = useRef(null);
  const mainChatAreaRef = useRef(null);
  const quillRef = useRef(null); // ✅ THÊM ref cho ReactQuill

  // State for the unread count
  const [unreadCount, setUnreadCount] = useState(0);


  // Initialize SignalR connection
  useEffect(() => {
    if (!accessToken || connectedConversationIds.length === 0) {
      return;
    }

    const chatProvider = new SignalRChatProvider(
      connectedConversationIds,
      accessToken
    );
    chatProvider.connect();

    setCurrentConvDetail(prev => {
      if (!prev) return prev;
      return { ...prev, chatMessages: [] };
    });

    setProvider(chatProvider);

    return () => {
      chatProvider.disconnect();
      setProvider(null);
    };
  }, [accessToken, connectedConversationIds]);

  // Handle provider listener setup
  useEffect(() => {
    if (!provider || !accessToken || !userId) {
      return;
    }

    const onReceive = async receivedMessage => {
      setCurrentConvDetail(prev => {
        if (!prev || receivedMessage.conversationId != currentConversationId) {
          return prev;
        }
        return {
          ...prev,
          chatMessages: [...prev.chatMessages, receivedMessage],
        };
      });

      setChatConversations(prev => {
        const index = prev.findIndex(
          c => c.conversationId === receivedMessage.conversationId
        );
        if (index === -1) return prev;

        const conversationToUpdate = prev[index];
        let newConversation = {
          ...conversationToUpdate,
          latestMessage: receivedMessage,
        };

        if (newConversation.conversationId !== currentConversationId) {
          newConversation.isRead = false;
          newConversation.unreadCount = (newConversation.unreadCount || 0) + 1;
        } else {
          newConversation.isRead = true;
          newConversation.unreadCount = 0;
        }

        const updatedList = prev.filter(
          c => c.conversationId !== receivedMessage.conversationId
        );
        updatedList.unshift(newConversation);
        return updatedList;
      });

      if (
        receivedMessage.senderId !== userId &&
        receivedMessage.conversationId === currentConversationId
      ) {
        try {
          await ChatAPI.patchChatIsRead(currentConversationId);
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }

      provider.broadcastMessageReadUpdate(
        currentConversationId,
        receivedMessage.messageId
      );
    };

    const onReceiveHistory = receivedMessages => {
      setCurrentConvDetail(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...prev.chatMessages, ...receivedMessages],
        };
      });
    };

    const onReceiveNoti = receivedNoti => {
      setNotifications(prev => [...prev, receivedNoti]);
      setUnreadCount(prev => prev + 1);
    };

    const onReceiveAllNoti = receivedNotis => {
      setNotifications(receivedNotis);
    };

    const onMessageReadUpdateReceived = (
      receivedUserId,
      conversationId,
      readMessageId
    ) => {
      if (currentConversationId != conversationId) return;

      setCurrentConvDetail(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          chatMessages: prev.chatMessages.map(msg => {
            if (
              msg.messageId == readMessageId &&
              !msg.readUserIds.find(x => x == receivedUserId)
            ) {
              return {
                ...msg,
                readUserIds: [...msg.readUserIds, receivedUserId],
              };
            } else if (
              msg.messageId != readMessageId &&
              msg.readUserIds.find(x => x == receivedUserId)
            ) {
              return {
                ...msg,
                readUserIds: msg.readUserIds.filter(x => x != receivedUserId),
              };
            }
            return msg;
          }),
        };
      });
    };

    provider.onMessageReceied(onReceive);
    provider.onReceiveHistory(onReceiveHistory);
    provider.onNotiReceived(onReceiveNoti);
    provider.onNotiHistoryReceived(onReceiveAllNoti);
    provider.onMessageReadUpdateReceived(onMessageReadUpdateReceived);

    return () => {
      provider.offMessageReceived(onReceive);
      provider.offReceiveHistory(onReceiveHistory);
      provider.offNotiReceived(onReceiveNoti);
      provider.offNotiHistoryReceived(onReceiveAllNoti);
      provider.offMessageReadUpdateReceived(onMessageReadUpdateReceived);
    };
  }, [provider, currentConversationId, team, accessToken, userId]);

  // Handle changing conversation focus
  useEffect(() => {
    if (
      currentConversationId === -1 ||
      provider == null ||
      accessToken == null
    ) {
      return;
    }

    const loadConversationDetails = async () => {
      try {
        const markReadResponse = await ChatAPI.patchChatIsRead(
          currentConversationId
        );

        if (markReadResponse && markReadResponse.isSuccess) {
          setChatConversations(prevConversations => {
            return prevConversations.map(conversation => {
              if (conversation.conversationId === currentConversationId) {
                return { ...conversation, isRead: true, unreadCount: 0 };
              }
              return conversation;
            });
          });
        }

        setCurrentConvDetail(null);
        const response = await ChatAPI.getChatById(currentConversationId);

        if (response && response.isSuccess && response.chatConversation) {
          const conversation = response.chatConversation;
          setCurrentConvDetail(conversation);

          if (
            conversation.latestMessage &&
            currentConversationId === conversation.conversationId
          ) {
            provider.broadcastMessageReadUpdate(
              currentConversationId,
              conversation.latestMessage.messageId
            );
          }
        }
      } catch (error) {
        console.error('Failed to load conversation details:', error);
      }
    };

    loadConversationDetails();
  }, [provider, currentConversationId, team, accessToken]);

  // Handle auto-scrolling
  useEffect(() => {
    if (!messageListRef.current) return;

    const element = messageListRef.current;
    const isScrolledToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 500;

    if (isScrolledToBottom) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 0);
    }
  }, [currentConvDetail]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchConversations = async () => {
      try {
        if (team.teamId) {
          const response = await ChatAPI.getChat(team.teamId);

          if (response && response.isSuccess && response.chatConversations) {
            setChatConversations(response.chatConversations);
            const conversationIds = response.chatConversations.map(
              c => c.conversationId
            );
            setConnectedConversationIds(conversationIds);
          }
        } else {
          setChatConversations([]);
        }
      } catch (error) {
        console.error('Failed to fetch chat conversations:', error);
        setChatConversations([]);
      }
    };

    fetchConversations();
  }, [team, accessToken]);

  const handleSendMessage = () => {
    const isEmptyInput = !getMessagePreview(inputMessage).trim();
    if (provider && !isEmptyInput) {
      const safeHtml = DOMPurify.sanitize(inputMessage.trim());
      provider.sendMessage(currentConversationId, safeHtml);
      setInputMessage('');
    }
  };

  // ✅ THÊM: Handle Enter key press
  const handleKeyPress = event => {
    // Check if Enter is pressed WITHOUT Shift (Shift+Enter = new line)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      handleSendMessage();
    }
  };

  const formatTime = isoString => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function formatDateHeader(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const getMessagePreview = (htmlContent, maxLength = 80) => {
    if (!htmlContent) return '';

    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      USE_PROFILES: { html: false },
    });
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    let plainText = tempDiv.textContent || tempDiv.innerText || '';
    plainText = plainText.replace(/\s+/g, ' ').trim();

    if (plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
  };

  const handleNotificationOpen = () => {
    setUnreadCount(0);
  };

  // ✅ THÊM: Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean'],
  ];

  if (!accessToken) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center p-8 bg-white rounded-2xl shadow-xl max-w-md'>
          <div className='flex justify-center mb-4'>
            <MessageCircle className='w-16 h-16 text-blue-500' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Authentication Required
          </h2>
          <p className='text-gray-600'>
            Please login to access the messaging feature
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm z-10'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center space-x-3'>
            {/* ✅ THÊM: Back Button */}
            <button
              onClick={handleBack}
              className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 group'
              title='Go back'
              aria-label='Go back'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors' />
            </button>

            <MessageCircle className='w-7 h-7 text-blue-500' />
            <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              Messages
            </h1>
          </div>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onOpen={handleNotificationOpen}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden' ref={mainChatAreaRef}>
        {/* Conversations List */}
        <div className='w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm'>
          <div className='p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center'>
              <MessageCircle className='w-5 h-5 mr-2 text-blue-500' />
              Conversations
            </h2>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {chatConversations.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-400 px-4 py-12'>
                <MessageCircle className='w-12 h-12 mb-3 text-gray-300' />
                <p className='text-sm text-center text-gray-500'>
                  No conversations yet
                </p>
                <p className='text-xs text-center text-gray-400 mt-1'>
                  Start chatting with your team
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {chatConversations.map(conv => (
                  <div
                    key={conv.conversationId}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 relative ${
                      conv.conversationId === currentConversationId
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'border-l-4 border-transparent hover:border-blue-200'
                    }`}
                    onClick={() =>
                      setCurrentConversationId(conv.conversationId)
                    }
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='font-semibold text-gray-900 truncate flex-1 pr-2'>
                        {conv.conversationName}
                      </h3>
                      {(!conv.isRead || conv.unreadCount > 0) && (
                        <span className='flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-xs font-bold shadow-sm'>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className='flex items-center text-xs text-gray-500 mb-2'>
                      <Users className='w-3.5 h-3.5 mr-1' />
                      <span className='truncate'>{conv.teamName}</span>
                    </div>

                    {conv.latestMessage ? (
                      <div className='text-sm text-gray-600 truncate flex items-start'>
                        <span className='font-medium text-gray-700 mr-1'>
                          {conv.latestMessage.senderName}:
                        </span>
                        <span className='text-gray-500 truncate flex-1'>
                          {getMessagePreview(conv.latestMessage.message, 35)}
                        </span>
                      </div>
                    ) : (
                      <p className='text-sm text-gray-400 italic flex items-center'>
                        <MessageCircle className='w-3.5 h-3.5 mr-1' />
                        No messages yet
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className='flex-1 flex flex-col bg-white'>
          {currentConversationId === -1 ? (
            <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50'>
              <div className='text-center max-w-md px-6'>
                <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-lg'>
                  <MessageCircle className='w-12 h-12 text-blue-500' />
                </div>
                <h3 className='text-2xl font-bold text-gray-800 mb-3'>
                  Select a conversation
                </h3>
                <p className='text-gray-500'>
                  Choose a conversation from the list to start chatting with
                  your team
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {currentConvDetail && (
                <div className='border-b border-gray-200 bg-gradient-to-r from-white to-blue-50 px-6 py-4 shadow-sm'>
                  <h2 className='text-lg font-bold text-gray-900 flex items-center'>
                    <MessageCircle className='w-5 h-5 mr-2 text-blue-500' />
                    {currentConvDetail.conversationName}
                  </h2>
                  <div className='flex items-center mt-1 text-sm text-gray-600'>
                    <Users className='w-4 h-4 mr-1' />
                    <span>{currentConvDetail.teamName}</span>
                    <span className='mx-2'>•</span>
                    <span className='text-xs text-gray-500'>
                      {currentConvDetail.teamMembers?.length + 1} members
                    </span>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div
                ref={messageListRef}
                className='flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 transparent',
                }}
              >
                {!currentConvDetail ||
                currentConvDetail.chatMessages.length === 0 ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center text-gray-400'>
                      <MessageCircle className='w-16 h-16 mx-auto mb-3 text-gray-300' />
                      <p className='text-lg font-medium text-gray-500'>
                        No messages yet
                      </p>
                      <p className='text-sm text-gray-400 mt-1'>
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  currentConvDetail.chatMessages.map((msg, index) => {
                    const isMine = msg.senderId == userId;
                    let showDateHeader = false;
                    const currentDate = new Date(msg.sendAt);

                    if (index === 0) {
                      showDateHeader = true;
                    } else {
                      const prevDate = new Date(
                        currentConvDetail.chatMessages[index - 1].sendAt
                      );
                      if (!isSameDay(currentDate, prevDate)) {
                        showDateHeader = true;
                      }
                    }

                    return (
                      <React.Fragment key={msg.messageId}>
                        {showDateHeader && (
                          <div className='flex items-center justify-center my-6'>
                            <div className='flex items-center px-4 py-1.5 rounded-full bg-gray-200 text-xs font-medium text-gray-600 shadow-sm'>
                              <Calendar className='w-3.5 h-3.5 mr-1.5' />
                              {formatDateHeader(currentDate)}
                            </div>
                          </div>
                        )}

                        <div
                          id={`message-${msg.messageId}`}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-in] transition-colors duration-500`}
                        >
                          <div
                            className={`max-w-md ${isMine ? 'ml-12' : 'mr-12'}`}
                          >
                            {!isMine && (
                              <div className='flex items-center text-xs font-medium text-gray-600 mb-1 ml-3'>
                                <div className='w-2 h-2 rounded-full bg-blue-400 mr-1.5'></div>
                                {msg.senderName}
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                                isMine
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                              }`}
                            >
                              <div
                                className='text-sm break-words leading-relaxed'
                                dangerouslySetInnerHTML={{
                                  __html: msg.message,
                                }}
                              />
                              <div
                                className={`flex items-center text-xs mt-2 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}
                              >
                                <Clock className='w-3 h-3 mr-1' />
                                {formatTime(msg.sendAt)}
                                {isMine &&
                                  msg.readUserIds &&
                                  msg.readUserIds.length > 0 && (
                                    <CheckCheck className='w-3.5 h-3.5 ml-2 text-blue-200' />
                                  )}
                              </div>
                            </div>

                            {msg.readUserIds && msg.readUserIds.length > 0 && (
                              <div className='flex items-center space-x-1 mt-1.5 ml-3'>
                                {msg.readUserIds.map(readUserId => {
                                  let avatarUrl = '';
                                  let fullName = '';

                                  if (
                                    currentConvDetail.lecturer &&
                                    currentConvDetail.lecturer.lecturerId ===
                                      readUserId
                                  ) {
                                    avatarUrl =
                                      currentConvDetail.lecturer.avatarImg;
                                    fullName =
                                      currentConvDetail.lecturer.lecturerName;
                                  } else {
                                    let teamMember =
                                      currentConvDetail.teamMembers.find(
                                        x => x.studentId == readUserId
                                      );
                                    if (teamMember) {
                                      avatarUrl = teamMember.avatarImg;
                                      fullName = teamMember.fullname;
                                    } else {
                                      return null;
                                    }
                                  }

                                  return (
                                    <img
                                      key={readUserId}
                                      src={avatarUrl}
                                      alt={fullName}
                                      className='w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200'
                                      title={`Read by ${fullName}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className='border-t border-gray-200 bg-white p-4 shadow-lg'>
                <div className='flex items-end space-x-3'>
                  <div
                    className='flex-1 bg-gray-50 rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
                    onKeyDown={handleKeyPress} // ✅ THÊM: Handle Enter key
                  >
                    <style>{`
                                            .quill-wrapper .ql-container {
                                                border: none !important;
                                                font-size: 14px;
                                                font-family: inherit;
                                            }
                                            .quill-wrapper .ql-editor {
                                                min-height: 60px;
                                                max-height: 120px;
                                                overflow-y: auto;
                                                padding: 12px 16px;
                                            }
                                            .quill-wrapper .ql-editor.ql-blank::before {
                                                color: #9ca3af;
                                                font-style: normal;
                                                left: 16px;
                                            }
                                            .quill-wrapper .ql-toolbar {
                                                border: none !important;
                                                border-bottom: 2px solid #e5e7eb !important;
                                                background-color: #f9fafb;
                                                padding: 8px;
                                            }
                                            .quill-wrapper .ql-stroke { stroke: #6b7280; }
                                            .quill-wrapper .ql-fill { fill: #6b7280; }
                                            .quill-wrapper .ql-picker-label { color: #6b7280; }
                                            .quill-wrapper .ql-toolbar button:hover .ql-stroke,
                                            .quill-wrapper .ql-toolbar button.ql-active .ql-stroke { stroke: #3b82f6; }
                                            .quill-wrapper .ql-toolbar button:hover .ql-fill,
                                            .quill-wrapper .ql-toolbar button.ql-active .ql-fill { fill: #3b82f6; }
                                            .quill-wrapper .ql-toolbar button:hover,
                                            .quill-wrapper .ql-toolbar button.ql-active {
                                                background-color: #dbeafe;
                                                border-radius: 4px;
                                            }
                                            @keyframes fadeIn {
                                                from { opacity: 0; transform: translateY(10px); }
                                                to { opacity: 1; transform: translateY(0); }
                                            }
                                        `}</style>
                    <div className='quill-wrapper'>
                      <ReactQuill
                        ref={quillRef}
                        modules={{ toolbar: toolbarOptions }}
                        value={inputMessage}
                        onChange={value => setInputMessage(value)}
                        placeholder='Type your message... (Press Enter to send, Shift+Enter for new line)'
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!getMessagePreview(inputMessage).trim()}
                    className='flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none'
                    title='Send message (Enter)'
                  >
                    <Send className='w-5 h-5' />
                  </button>
                </div>

                {/* ✅ THÊM: Keyboard hint */}
                <div className='mt-2 text-xs text-gray-400 text-center'>
                  Press{' '}
                  <kbd className='px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono'>
                    Enter
                  </kbd>{' '}
                  to send,{' '}
                  <kbd className='px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono'>
                    Shift+Enter
                  </kbd>{' '}
                  for new line
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
