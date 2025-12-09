import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, ExternalLink, X, MessageCircle } from 'lucide-react';

// Helper to format the time
const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
};

export default function NotificationBell({ notifications, unreadCount, onOpen }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Toggle dropdown and clear unread
    const toggleDropdown = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen && onOpen) {
            onOpen();
        }
    };

    // Handle notification click - simple version
    const handleNotificationClick = (notification) => {
        console.log('Clicked notification:', notification);
        
        setIsOpen(false);
        
        if (onOpen) {
            onOpen();
        }
        
        navigate('/chat');
    };

    // Show newest notifications first
    const reversedNotifications = [...notifications].reverse();

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 focus:outline-none  group"
                aria-label="Notifications"
            >
                <Bell 
                    className={`w-6 h-6 text-gray-600 group-hover:text-orangeFpt-600 transition-colors ${
                        unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''
                    }`}
                />
                
                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-md animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <style>{`
                        @keyframes slideDown {
                            from {
                                opacity: 0;
                                transform: translateY(-10px) scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }
                        @keyframes wiggle {
                            0%, 100% { transform: rotate(0deg); }
                            25% { transform: rotate(-15deg); }
                            75% { transform: rotate(15deg); }
                        }
                        .line-clamp-2 {
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                    `}</style>
                    
                    <div 
                        className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        style={{ animation: 'slideDown 0.2s ease-out' }}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-orangeFpt-500 via-orangeFpt-600 to-orange-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Bell className="w-5 h-5 text-white" />
                                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {notifications.length > 0 && (
                                        <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white font-semibold">
                                            {notifications.length}
                                        </span>
                                    )}
                                    <button
                                        onClick={toggleDropdown}
                                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                        aria-label="Close notifications"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div 
                            className="max-h-[480px] overflow-y-auto"
                            style={{ 
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#cbd5e1 transparent'
                            }}
                        >
                            {reversedNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-gray-400">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <Bell className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-base font-medium text-gray-500 mb-1">No notifications yet</p>
                                    <p className="text-sm text-gray-400 text-center">
                                        We'll notify you when something important happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {reversedNotifications.map((notif, index) => (
                                        <div
                                            key={notif.notificationId}
                                            onClick={() => handleNotificationClick(notif)}
                                            className="px-5 py-4 hover:bg-gradient-to-r hover:from-orangeFpt-50 hover:to-orange-50 transition-all duration-200 cursor-pointer group relative"
                                            style={{ 
                                                animation: `slideDown 0.3s ease-out ${index * 0.05}s backwards` 
                                            }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {/* Notification Icon */}
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orangeFpt-100 to-orange-100 flex items-center justify-center group-hover:from-orangeFpt-200 group-hover:to-orange-200 transition-all duration-200 shadow-sm">
                                                    <MessageCircle className="w-5 h-5 text-orangeFpt-600" />
                                                </div>

                                                {/* Notification Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-orangeFpt-700 transition-colors">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                                                        {notif.content}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {formatTime(notif.createdAt)}
                                                        </span>
                                                        
                                                        {/* Show "Open Chat" indicator */}
                                                        <span className="text-xs font-semibold text-orangeFpt-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                            <MessageCircle className="w-3 h-3" />
                                                            Open Chat
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notif.isRead && (
                                                    <div className="flex-shrink-0 pt-1">
                                                        <div className="w-2 h-2 rounded-full bg-orangeFpt-500 shadow-sm"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Click indicator arrow */}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                                                <svg className="w-5 h-5 text-orangeFpt-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                                <button 
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/chat');
                                    }}
                                    className="w-full text-sm font-semibold text-orangeFpt-600 hover:text-orangeFpt-700 py-2 hover:underline flex items-center justify-center gap-2 hover:gap-3 transition-all"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Go to Messages</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
