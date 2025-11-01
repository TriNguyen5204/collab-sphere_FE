import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (serverUrl = 'http://localhost:5000') => {
  const [me, setMe] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) return;

    console.log('🔌 Initializing socket connection...');
    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('me', id => {
      console.log('🆔 My socket ID:', id);
      setMe(id);
    });

    return () => {
      console.log('🔌 Disconnecting socket...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl]);

  return { socket: socketRef.current, me };
};