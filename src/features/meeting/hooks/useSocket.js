import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

// Use environment variable or fallback to local/production
const getSocketServerUrl = () => {
  // Check if running in development (localhost)
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  // Production - use Railway server from environment variable
  const portUrl = import.meta.env.VITE_PORT_URL;
  return portUrl ? `https://${portUrl}` : 'https://server-webrtc-production-3be0.up.railway.app';
};

export const useSocket = (serverUrl = getSocketServerUrl()) => {
  const [me, setMe] = useState('');
  const socketRef = useRef(null);
  
  // Get authentication data from Redux store
  const accessToken = useSelector(state => state.user.accessToken);
  const userId = useSelector(state => state.user.userId);
  const fullName = useSelector(state => state.user.fullName);

  useEffect(() => {
    if (socketRef.current) return;

    // Don't connect if not authenticated
    if (!accessToken) {
      console.warn('⚠️ Cannot connect to socket: User not authenticated');
      return;
    }

    console.log('🔌 Initializing authenticated socket connection...');
    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      secure: true,
      withCredentials: true,
      // Send authentication data with socket connection
      auth: {
        token: accessToken,
        userId: userId,
        userName: fullName,
      },
    });
    socketRef.current = socket;

    socket.on('me', id => {
      console.log('🆔 My socket ID:', id);
      setMe(id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('unauthorized', (reason) => {
      console.error('🚫 Socket unauthorized:', reason);
      socket.disconnect();
    });

    return () => {
      console.log('🔌 Disconnecting socket...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl, accessToken, userId, fullName]);

  return { socket: socketRef.current, me };
};