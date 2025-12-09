import { SignalRChatProvider } from './hooks/SignalrChatProvider';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import React from 'react';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

import * as ChatAPI from './services/chatApi';
import { getClassesByStudentId } from '../../services/studentApi.js';
import { getLecturerClasses } from '../../services/classApi.js';
import { getSemester } from '../../services/userService.js';
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
  ArrowLeft,
  Filter,
  ChevronDown,
  Info,
  X,
  Mail,
  Phone,
  UserCircle,
  ArrowDown,
  User,
} from 'lucide-react';

// --- Chat styles with glassmorphism ---
const ChatStyles = () => (
  <style>{`
    .chat-bubble-right {
      position: relative;
      background: #F36F21;
      color: #ffffff;
      border-radius: 18px 18px 4px 18px;
      padding: 10px 14px;
      box-shadow: 0 1px 2px rgba(243, 111, 33, 0.2);
      max-width: 100%;
    }
    
    .chat-bubble-right::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: -6px;
      width: 12px;
      height: 16px;
      background: #F36F21;
      clip-path: polygon(0 0, 0 100%, 100% 100%);
    }
    
    .chat-bubble-left {
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      color: #1a1a1a;
      border-radius: 18px 18px 18px 4px;
      padding: 10px 14px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.06);
      max-width: 100%;
    }
    
    .chat-bubble-left::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: -6px;
      width: 12px;
      height: 16px;
      background: rgba(255, 255, 255, 0.95);
      clip-path: polygon(100% 0, 0 100%, 100% 100%);
    }
    
    /* Frosted glass sidebar */
    .glass-sidebar {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    .glass-sidebar-item {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }
    
    .glass-sidebar-item:hover {
      background: rgba(255, 255, 255, 0.9);
    }
    
    .glass-sidebar-item.active {
      background: rgba(255, 255, 255, 0.95);
      border-left: 3px solid #F36F21;
    }
    
    /* Subtle pattern background */
    .chat-pattern-bg {
      background-color: #f8f9fa;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    
    /* Floating input bar */
    .floating-input {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 20px;
      padding: 12px 14px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }
    
    /* Floating glass input bar */
    .glass-input-bar {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.05);
    }
    
    /* Message text typography */
    .message-text {
      font-size: 15px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    
    .message-text p {
      margin: 0;
    }
    
    /* Read receipts styling */
    .read-receipts {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
      padding-right: 2px;
    }
    
    .read-receipts-avatars {
      display: flex;
      flex-direction: row-reverse;
    }
    
    .read-receipts-avatars > * {
      margin-left: -6px;
    }
    
    .read-receipts-avatars > *:last-child {
      margin-left: 0;
    }
    
    /* Quill editor custom styles */
    .chat-quill .ql-container {
      border: none !important;
      font-size: 15px;
      font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .chat-quill .ql-editor {
      min-height: 44px;
      max-height: 120px;
      overflow-y: auto;
      padding: 12px 16px;
      line-height: 1.5;
    }
    .chat-quill .ql-editor.ql-blank::before {
      color: #9ca3af;
      font-style: normal;
      left: 16px;
    }
    .chat-quill .ql-toolbar {
      border: none !important;
      border-bottom: 1px solid rgba(0,0,0,0.08) !important;
      background: rgba(249, 250, 251, 0.8);
      padding: 8px;
      border-radius: 16px 16px 0 0;
    }
    .chat-quill .ql-stroke { stroke: #6b7280; }
    .chat-quill .ql-fill { fill: #6b7280; }
    .chat-quill .ql-picker-label { color: #6b7280; }
    .chat-quill .ql-toolbar button:hover .ql-stroke,
    .chat-quill .ql-toolbar button.ql-active .ql-stroke { stroke: #F36F21; }
    .chat-quill .ql-toolbar button:hover .ql-fill,
    .chat-quill .ql-toolbar button.ql-active .ql-fill { fill: #F36F21; }
    .chat-quill .ql-toolbar button:hover,
    .chat-quill .ql-toolbar button.ql-active {
      background: rgba(243, 111, 33, 0.1);
      border-radius: 6px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .animate-slide-in {
      animation: slideIn 0.2s ease-out;
    }
  `}</style>
);

// --- Avatar Component with Fallback ---
const AvatarWithFallback = ({ src, name, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const colorClass = useMemo(() => {
    if (!name) return 'bg-slate-100 text-slate-600';
    const colors = [
      'bg-red-100 text-red-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-orangeFpt-100 text-orangeFpt-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  const shouldShowImage = src && !imageError && !src.endsWith('/image/upload');

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold ${className} ${!shouldShowImage ? colorClass : 'bg-slate-100'}`}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// --- Chat Skeleton Loading Component ---
const ChatSkeleton = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
            <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List Skeleton */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area Skeleton */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="h-5 w-48 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${i % 2 === 0 ? 'bg-orangeFpt-100' : 'bg-slate-100'} rounded-2xl px-4 py-3`}>
                  <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="h-24 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Conversation Loading Skeleton ---
const ConversationSkeleton = () => (
  <div className="p-4 space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
      </div>
    ))}
  </div>
);

// --- Messages Loading Skeleton ---
const MessagesSkeleton = () => (
  <div className="flex-1 p-6 space-y-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-md ${i % 2 === 0 ? 'bg-orangeFpt-50' : 'bg-slate-100'} rounded-2xl px-4 py-3`}>
          <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function ChatComponent() {
  const [provider, setProvider] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const { team } = useTeam();

  // Get accessToken, userId, and roleName from Redux store
  const accessToken = useSelector(state => state.user.accessToken);
  const userId = useSelector(state => state.user.userId);
  const roleName = useSelector(state => state.user.roleName);

  const navigate = useNavigate();
  
  // Filter states
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Chat Conversations
  const [chatConversations, setChatConversations] = useState([]);
  const [connectedConversationIds, setConnectedConversationIds] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(-1);
  const [currentConvDetail, setCurrentConvDetail] = useState(null);

  // Loading states
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Create refs for the message list DOM element
  const messageListRef = useRef(null);
  const mainChatAreaRef = useRef(null);
  const quillRef = useRef(null);

  // State for detail sidebar
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);

  // NEW: State to track if user manually scrolled up
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Load semesters when component mounts
  useEffect(() => {
    if (!accessToken || !userId) return;

    const fetchSemesters = async () => {
      try {
        setIsLoadingFilters(true);
        const response = await getSemester();
        
        if (response) {
          setSemesters(response);
          
          // Auto-select first semester if available
          if (response.semesters && response.semesters.length > 0) {
            setSelectedSemesterId(response.semesters[0].semesterId);
          } else if (response.length > 0) {
            setSelectedSemesterId(response[0].semesterId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch semesters:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchSemesters();
  }, [accessToken, userId]);

  // Load classes when semester changes
  useEffect(() => {
    if (!accessToken || !userId || !selectedSemesterId || !roleName) return;

    const fetchClasses = async () => {
      try {
        setIsLoadingFilters(true);
        let response;

        if (roleName === 'LECTURER') {
          // Pass semesterId to filter lecturer classes
          response = await getLecturerClasses(userId, { semesterId: selectedSemesterId });
        } else if (roleName === 'STUDENT') {
          // Pass viewAll and semesterId to get all classes for the selected semester
          response = await getClassesByStudentId(userId, { 
            viewAll: true,
            semesterId: selectedSemesterId 
          });
        } else {
          console.warn('Unknown role:', roleName);
          return;
        }

        console.log('Fetched classes for role', roleName, ':', response);

        if (response) {
          // Filter classes by selected semester (as a safety check, use Number for comparison)
          const filteredClasses = response.filter(
            cls => Number(cls.semesterId) === Number(selectedSemesterId)
          );
          console.log('Filtered classes:', filteredClasses);
          setClasses(filteredClasses);
          
          // Auto-select first class if available
          if (filteredClasses.length > 0) {
            setSelectedClassId(filteredClasses[0].classId);
          } else {
            setSelectedClassId(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchClasses();
  }, [accessToken, userId, selectedSemesterId, roleName]);

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
      console.log("onReceive called:", { 
        receivedMessage, 
        currentConversationId,
        match: Number(receivedMessage.conversationId) === Number(currentConversationId)
      });
      
      setCurrentConvDetail(prev => {
        console.log("setCurrentConvDetail:", { prev, receivedMessage });
        if (!prev || Number(receivedMessage.conversationId) !== Number(currentConversationId)) {
          console.log("Skipping message - no prev or conversation mismatch");
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

      // Only mark as read and broadcast if message is in the currently viewed conversation
      if (Number(receivedMessage.conversationId) === Number(currentConversationId)) {
        // Only call API if message is from someone else
        if (Number(receivedMessage.senderId) !== Number(userId)) {
          try {
            await ChatAPI.patchChatIsRead(currentConversationId);
          } catch (error) {
            console.error('Failed to mark message as read:', error);
          }
        }

        // Only broadcast if provider is connected
        if (provider.isConnected()) {
          provider.broadcastMessageReadUpdate(
            currentConversationId,
            receivedMessage.messageId
          );
        }
      }
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

    const onMessageReadUpdateReceived = (
      receivedUserId,
      conversationId,
      readMessageId
    ) => {
      if (Number(currentConversationId) !== Number(conversationId)) return;

      setCurrentConvDetail(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          chatMessages: prev.chatMessages.map(msg => {
            if (
              Number(msg.messageId) === Number(readMessageId) &&
              !msg.readUserIds.find(x => Number(x) === Number(receivedUserId))
            ) {
              return {
                ...msg,
                readUserIds: [...msg.readUserIds, receivedUserId],
              };
            } else if (
              Number(msg.messageId) !== Number(readMessageId) &&
              msg.readUserIds.find(x => Number(x) === Number(receivedUserId))
            ) {
              return {
                ...msg,
                readUserIds: msg.readUserIds.filter(x => Number(x) !== Number(receivedUserId)),
              };
            }
            return msg;
          }),
        };
      });
    };

    provider.onMessageReceied(onReceive);
    provider.onReceiveHistory(onReceiveHistory);
    provider.onMessageReadUpdateReceived(onMessageReadUpdateReceived);

    return () => {
      provider.offMessageReceived(onReceive);
      provider.offReceiveHistory(onReceiveHistory);
      provider.offMessageReadUpdateReceived(onMessageReadUpdateReceived);
    };
  }, [provider, currentConversationId, accessToken, userId]);

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
      setIsLoadingMessages(true);
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
        console.log("getChatById response:", response);

        if (response && response.isSuccess && response.chatConversation) {
          const conversation = response.chatConversation;
          console.log("Conversation details:", {
            lecturer: conversation.lecturer,
            teamMembers: conversation.teamMembers
          });
          setCurrentConvDetail(conversation);

          // Only broadcast read update if provider is connected
          if (
            conversation.latestMessage &&
            currentConversationId === conversation.conversationId &&
            provider.isConnected()
          ) {
            provider.broadcastMessageReadUpdate(
              currentConversationId,
              conversation.latestMessage.messageId
            );
          }
        }
      } catch (error) {
        console.error('Failed to load conversation details:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadConversationDetails();
  }, [provider, currentConversationId, accessToken]);

  // ✨ IMPROVED: Handle scroll detection to show "Scroll to bottom" button
  useEffect(() => {
    const element = messageListRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // User scrolled up if more than 100px from bottom
      const hasScrolledUp = distanceFromBottom > 100;
      setUserScrolledUp(hasScrolledUp);
      setShowScrollToBottom(hasScrolledUp);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  // ✨ IMPROVED: Auto-scroll when messages change (only if user hasn't scrolled up)
  useEffect(() => {
    if (!messageListRef.current || !currentConvDetail) return;
    
    // Only auto-scroll if user hasn't manually scrolled up
    if (!userScrolledUp) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
      });
    }
  }, [currentConvDetail?.chatMessages, userScrolledUp]);

  // ✨ IMPROVED: Force scroll to bottom when switching conversations
  useEffect(() => {
    if (!messageListRef.current || currentConversationId === -1 || !currentConvDetail) return;

    // Reset user scroll state when switching conversations
    setUserScrolledUp(false);
    setShowScrollToBottom(false);

    // Always scroll to bottom when loading a new conversation
    // Add delay to ensure DOM is fully rendered with messages
    const timer = setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentConversationId, currentConvDetail?.conversationId]);

  // Fetch conversations when semester and class are selected
  useEffect(() => {
    if (!accessToken || !selectedSemesterId || !selectedClassId) {
      setChatConversations([]);
      setConnectedConversationIds([]);
      return;
    }

    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const response = await ChatAPI.getChat(selectedSemesterId, selectedClassId);

        if (response && response.isSuccess && response.chatConversations) {
          setChatConversations(response.chatConversations);
          const conversationIds = response.chatConversations.map(
            c => c.conversationId
          );
          setConnectedConversationIds(conversationIds);
        } else {
          setChatConversations([]);
          setConnectedConversationIds([]);
        }
      } catch (error) {
        console.error('Failed to fetch chat conversations:', error);
        setChatConversations([]);
        setConnectedConversationIds([]);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [selectedSemesterId, selectedClassId, accessToken]);

  const handleSendMessage = () => {
    const isEmptyInput = !getMessagePreview(inputMessage).trim();
    if (provider && !isEmptyInput) {
      const safeHtml = DOMPurify.sanitize(inputMessage.trim());
      provider.sendMessage(currentConversationId, safeHtml);
      setInputMessage('');
      
      // Reset scroll state when user sends message
      setUserScrolledUp(false);
    }
  };

  const handleKeyPress = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // ✨ NEW: Function to scroll to bottom manually
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setUserScrolledUp(false);
      setShowScrollToBottom(false);
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

  const handleBack = () => {
    navigate(-1);
  };

  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean'],
  ];

  if (!accessToken) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-orangeFpt-50 to-orangeFpt-100'>
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
    <div className='flex flex-col h-screen bg-gray-100'>
      <ChatStyles />
      
      {/* Header - Clean white with subtle shadow */}
      <div className='bg-white border-b border-gray-200/80 shadow-sm z-10'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={handleBack}
              className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 group'
              title='Go back'
              aria-label='Go back'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600 group-hover:text-orangeFpt-500 transition-colors' />
            </button>

            <h1 className='text-2xl font-bold text-gray-900'>
              Messages
            </h1>
          </div>
        </div>

        {/* Filter Section - Subtle glass effect */}
        <div className='px-6 py-3 bg-gradient-to-r from-gray-50/80 to-white border-t border-gray-100'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center text-sm font-medium text-gray-600'>
              <Filter className='w-4 h-4 mr-2 text-orangeFpt-500' />
              Filters:
            </div>

            {/* Semester Dropdown */}
            <div className='relative'>
              <select
                value={selectedSemesterId || ''}
                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                disabled={isLoadingFilters || semesters.length === 0}
                className='appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-orangeFpt-300 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] shadow-sm'
              >
                <option value='' disabled>Select Semester</option>
                {semesters.map(semester => (
                  <option key={semester.semesterId} value={semester.semesterId}>
                    {semester.semesterName}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>

            {/* Class Dropdown */}
            <div className='relative'>
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                disabled={isLoadingFilters || classes.length === 0 || !selectedSemesterId}
                className='appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-orangeFpt-300 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px] shadow-sm'
              >
                <option value='' disabled>
                  {classes.length === 0 ? 'No classes available' : 'Select Class'}
                </option>
                {classes.map(cls => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.className}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>

            {isLoadingFilters && (
              <div className='flex items-center text-sm text-gray-500'>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-orangeFpt-500 border-t-transparent mr-2'></div>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two-pane layout */}
      <div className='flex flex-1 overflow-hidden' ref={mainChatAreaRef}>
        {/* Conversations List - Frosted glass sidebar */}
        <div className='w-80 glass-sidebar border-r border-gray-200/50 flex flex-col'>
          <div className='p-4 border-b border-gray-200/50'>
            <h2 className='text-base font-semibold text-gray-800 flex items-center'>
              <MessageCircle className='w-5 h-5 mr-2 text-orangeFpt-500' />
              Conversations
            </h2>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {!selectedSemesterId || !selectedClassId ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-400 px-4 py-12'>
                <Filter className='w-12 h-12 mb-3 text-gray-300' />
                <p className='text-sm text-center text-gray-500'>
                  Please select a semester and class
                </p>
                <p className='text-xs text-center text-gray-400 mt-1'>
                  to view conversations
                </p>
              </div>
            ) : isLoadingConversations ? (
              <ConversationSkeleton />
            ) : chatConversations.length === 0 ? (
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
              <div className='p-2 space-y-1'>
                {chatConversations.map(conv => (
                  <div
                    key={conv.conversationId}
                    className={`p-3 cursor-pointer rounded-xl transition-all duration-200 animate-slide-in ${
                      conv.conversationId === currentConversationId
                        ? 'glass-sidebar-item active shadow-sm'
                        : 'glass-sidebar-item hover:shadow-sm'
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
                        <span className='flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orangeFpt-500 text-white text-xs font-bold shadow-sm'>
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
        <div className='flex-1 flex flex-col bg-white relative'>
          {currentConversationId === -1 ? (
            <div className='flex-1 flex items-center justify-center chat-pattern-bg'>
              <div className='text-center max-w-md px-6'>
                <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6'>
                  <MessageCircle className='w-10 h-10 text-orangeFpt-500' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>
                  Select a conversation
                </h3>
                <p className='text-gray-500 text-sm'>
                  Choose a conversation from the list to start chatting with your team
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header - Clean white */}
              {currentConvDetail && (
                <div className='border-b border-gray-100 bg-white px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h2 className='text-lg font-semibold text-gray-900'>
                        {currentConvDetail.conversationName}
                      </h2>
                      <div className='flex items-center mt-0.5 text-sm text-gray-500'>
                        <Users className='w-3.5 h-3.5 mr-1' />
                        <span>{currentConvDetail.teamName}</span>
                        <span className='mx-2 text-gray-300'>•</span>
                        <span className='text-gray-400'>
                          {currentConvDetail.teamMembers?.length + 1} members
                        </span>
                      </div>
                    </div>
                    
                    {/* Info Button */}
                    <button
                      onClick={() => setShowDetailSidebar(!showDetailSidebar)}
                      className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 group'
                      title='Conversation details'
                    >
                      <Info className='w-5 h-5 text-gray-400 group-hover:text-orangeFpt-500 transition-colors' />
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Area - Pattern background */}
              <div
                ref={messageListRef}
                className='flex-1 overflow-y-auto px-6 py-4 space-y-3 chat-pattern-bg relative'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent',
                }}
              >
                {isLoadingMessages ? (
                  <MessagesSkeleton />
                ) : !currentConvDetail ||
                currentConvDetail.chatMessages.length === 0 ? (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center text-gray-400'>
                      <MessageCircle className='w-14 h-14 mx-auto mb-3 text-gray-300' />
                      <p className='text-base font-medium text-gray-500'>
                        No messages yet
                      </p>
                      <p className='text-sm text-gray-400 mt-1'>
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  currentConvDetail.chatMessages.map((msg, index) => {
                    const isMine = Number(msg.senderId) === Number(userId);
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
                          <div className='flex items-center justify-center my-4'>
                            <div className='px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-500 shadow-sm border border-gray-100'>
                              {formatDateHeader(currentDate)}
                            </div>
                          </div>
                        )}

                        <div
                          id={`message-${msg.messageId}`}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease-out]`}
                        >
                          <div className={`max-w-[65%] ${isMine ? 'ml-12' : 'mr-12'}`}>
                            {/* Sender name for others' messages */}
                            {!isMine && (
                              <div className='text-xs font-medium text-orangeFpt-600 mb-1 ml-2'>
                                {msg.senderName}
                              </div>
                            )}
                            
                            {/* Message bubble */}
                            <div className={isMine ? 'chat-bubble-right' : 'chat-bubble-left'}>
                              <div
                                className='message-text'
                                dangerouslySetInnerHTML={{
                                  __html: msg.message,
                                }}
                              />
                              <div className={`flex items-center justify-end text-xs mt-1.5 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                <span className='text-[11px]'>{formatTime(msg.sendAt)}</span>
                                {isMine && msg.readUserIds && msg.readUserIds.length > 0 && (
                                  <CheckCheck className='w-4 h-4 ml-1 text-white/80' />
                                )}
                              </div>
                            </div>

                            {/* Read receipts */}
                            {msg.readUserIds && msg.readUserIds.length > 0 && (() => {
                              const readersToShow = msg.readUserIds.filter(
                                readerId => Number(readerId) !== Number(msg.senderId)
                              );
                              
                              if (readersToShow.length === 0) return null;
                              
                              return (
                                <div className={`flex items-center mt-1.5 ${isMine ? 'justify-end mr-1' : 'justify-start ml-3'}`}>
                                  <div className='flex items-center -space-x-2'>
                                    {readersToShow.map(readUserId => {
                                      let avatarUrl = '';
                                      let fullName = '';

                                      // Check if reader is the lecturer (API returns userId, not lecturerId)
                                      if (
                                        currentConvDetail.lecturer &&
                                        Number(currentConvDetail.lecturer.userId || currentConvDetail.lecturer.lecturerId) ===
                                          Number(readUserId)
                                      ) {
                                        avatarUrl =
                                          currentConvDetail.lecturer.avatarImg;
                                        fullName =
                                          currentConvDetail.lecturer.fullName || currentConvDetail.lecturer.lecturerName;
                                      } else {
                                        // Check if reader is a team member (API returns userId, not studentId)
                                        let teamMember =
                                          currentConvDetail.teamMembers?.find(
                                            x => Number(x.userId || x.studentId) === Number(readUserId)
                                          );
                                        if (teamMember) {
                                          avatarUrl = teamMember.avatarImg;
                                          fullName = teamMember.fullName || teamMember.fullname;
                                        } else {
                                          // User not found in lecturer or teamMembers - skip
                                          console.log('Read user not found:', readUserId, {
                                            lecturer: currentConvDetail.lecturer,
                                            teamMembers: currentConvDetail.teamMembers
                                          });
                                          return null;
                                        }
                                      }

                                      return (
                                        <AvatarWithFallback
                                          key={readUserId}
                                          src={avatarUrl}
                                          alt={fullName}
                                          name={fullName}
                                          className='w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100 hover:z-10 hover:scale-110 transition-transform cursor-pointer'
                                          title={`Read by ${fullName}`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                
                {/* Scroll to bottom button */}
                {showScrollToBottom && (
                  <button
                    onClick={scrollToBottom}
                    className='fixed bottom-28 right-[calc(25%+1rem)] z-50 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-orangeFpt-500 text-gray-600 hover:text-white rounded-full shadow-lg border border-gray-200 hover:border-orangeFpt-500 transition-all duration-200'
                    title='Scroll to bottom'
                  >
                    <ArrowDown className='w-5 h-5' />
                  </button>
                )}
              </div>

              {/* Floating Input Area */}
              <div className='floating-input mx-4 mb-4'>
                <div className='flex items-end gap-3'>
                  <div
                    className='flex-1 bg-white/80 rounded-2xl border border-white/50 overflow-hidden focus-within:border-orangeFpt-300 transition-colors duration-200'
                    onKeyDown={handleKeyPress}
                  >
                    <style>{`
                      .quill-wrapper .ql-container {
                        border: none !important;
                        font-size: 14px;
                        font-family: inherit;
                        background: transparent;
                      }
                      .quill-wrapper .ql-editor {
                        min-height: 44px;
                        max-height: 100px;
                        overflow-y: auto;
                        padding: 10px 14px;
                        background: transparent;
                      }
                      .quill-wrapper .ql-editor.ql-blank::before {
                        color: #9ca3af;
                        font-style: normal;
                        left: 14px;
                      }
                      .quill-wrapper .ql-toolbar {
                        border: none !important;
                        border-bottom: 1px solid rgba(0,0,0,0.05) !important;
                        background: rgba(255,255,255,0.5);
                        padding: 6px 8px;
                      }
                      .quill-wrapper .ql-stroke { stroke: #6b7280; }
                      .quill-wrapper .ql-fill { fill: #6b7280; }
                      .quill-wrapper .ql-picker-label { color: #6b7280; }
                      .quill-wrapper .ql-toolbar button:hover .ql-stroke,
                      .quill-wrapper .ql-toolbar button.ql-active .ql-stroke { stroke: #F36F21; }
                      .quill-wrapper .ql-toolbar button:hover .ql-fill,
                      .quill-wrapper .ql-toolbar button.ql-active .ql-fill { fill: #F36F21; }
                      .quill-wrapper .ql-toolbar button:hover,
                      .quill-wrapper .ql-toolbar button.ql-active {
                        background-color: rgba(243, 111, 33, 0.1);
                        border-radius: 6px;
                      }
                      .message-text { font-size: 14px; line-height: 1.5; word-break: break-word; }
                      .message-text p { margin: 0; }
                      .message-text p + p { margin-top: 0.25rem; }
                    `}</style>
                    <div className='quill-wrapper'>
                      <ReactQuill
                        ref={quillRef}
                        modules={{ toolbar: toolbarOptions }}
                        value={inputMessage}
                        onChange={value => setInputMessage(value)}
                        placeholder='Write a message...'
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!getMessagePreview(inputMessage).trim()}
                    className='flex items-center justify-center w-11 h-11 rounded-full bg-orangeFpt-500 hover:bg-orangeFpt-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
                    title='Send message (Enter)'
                  >
                    <Send className='w-5 h-5' />
                  </button>
                </div>

                <div className='mt-2 text-xs text-gray-400 text-center'>
                  <kbd className='px-1.5 py-0.5 bg-white/60 rounded text-gray-500 font-mono text-[10px]'>
                    Enter
                  </kbd>{' '}
                  send ·{' '}
                  <kbd className='px-1.5 py-0.5 bg-white/60 rounded text-gray-500 font-mono text-[10px]'>
                    Shift+Enter
                  </kbd>{' '}
                  new line
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Sidebar - Glass Style */}
        {showDetailSidebar && currentConvDetail && (
          <div className='w-80 bg-white/70 backdrop-blur-xl border-l border-white/30 flex flex-col shadow-xl overflow-y-auto'>
            {/* Header */}
            <div className='p-4 border-b border-gray-100/50 bg-white/50 backdrop-blur-sm flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-gray-800 flex items-center'>
                <Info className='w-4 h-4 mr-2 text-orangeFpt-500' />
                Details
              </h3>
              <button
                onClick={() => setShowDetailSidebar(false)}
                className='flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100/80 transition-all duration-200'
              >
                <X className='w-4 h-4 text-gray-500' />
              </button>
            </div>

            {/* Lecturer Section */}
            {currentConvDetail.lecturer && (
              <div className='p-4 border-b border-gray-100/50'>
                <h5 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-3'>
                  Lecturer
                </h5>
                <div className='flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/50 hover:bg-white/70 transition-colors'>
                  <AvatarWithFallback
                    src={currentConvDetail.lecturer.avatarImg}
                    alt={currentConvDetail.lecturer.fullName || currentConvDetail.lecturer.lecturerName || 'Lecturer'}
                    name={currentConvDetail.lecturer.fullName || currentConvDetail.lecturer.lecturerName || 'Lecturer'}
                    className='w-11 h-11 rounded-full ring-2 ring-orangeFpt-200 shadow-sm'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-gray-900 text-sm truncate'>
                      {currentConvDetail.lecturer.fullName || currentConvDetail.lecturer.lecturerName || 'Unknown Lecturer'}
                    </p>
                    {(currentConvDetail.lecturer.lecturerCode || currentConvDetail.lecturer.isTeacher) && (
                      <p className='text-xs text-orangeFpt-500 font-medium'>
                        {currentConvDetail.lecturer.lecturerCode || 'Instructor'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Team Members Section */}
            <div className='p-4 flex-1'>
              <div className='flex items-center justify-between mb-3'>
                <h5 className='text-xs font-medium text-gray-400 uppercase tracking-wider'>
                  Team Members
                </h5>
                <span className='text-xs bg-orangeFpt-100 text-orangeFpt-600 px-2 py-0.5 rounded-full font-medium'>
                  {currentConvDetail.teamMembers?.length || 0}
                </span>
              </div>
              
              <div className='space-y-1.5'>
                {currentConvDetail.teamMembers && currentConvDetail.teamMembers.length > 0 ? (
                  currentConvDetail.teamMembers.map(member => (
                    <div
                      key={member.userId || member.studentId || member.classMemberId}
                      className='flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 transition-colors cursor-pointer'
                    >
                      <AvatarWithFallback
                        src={member.avatarImg}
                        alt={member.fullName || member.fullname || 'Member'}
                        name={member.fullName || member.fullname || 'Member'}
                        className='w-9 h-9 rounded-full ring-1 ring-gray-200 shadow-sm'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 text-sm truncate'>
                          {member.fullName || member.fullname || 'Unknown Member'}
                        </p>
                        <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                          {member.studentCode && <span>{member.studentCode}</span>}
                          {member.teamRole && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              member.teamRole === 'LEADER' 
                                ? 'bg-yellow-100/80 text-yellow-600' 
                                : 'bg-gray-100/80 text-gray-500'
                            }`}>
                              {member.teamRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8 text-gray-400'>
                    <Users className='w-10 h-10 mx-auto mb-2 text-gray-300' />
                    <p className='text-sm'>No team members</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {currentConvDetail.latestMessage && (
              <div className='p-4 border-t border-gray-100/50 bg-white/40'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-400'>Last activity</span>
                  <span className='font-medium text-gray-600'>
                    {new Date(currentConvDetail.latestMessage.sendAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}