import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import io from 'socket.io-client';

// ❌ KHÔNG khởi tạo socket ở đây
// const socket = io('http://localhost:5000'); 

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous';
  const [stream, setStream] = useState(null);
  const [groupPeers, setGroupPeers] = useState([]);
  const [me, setMe] = useState('');
  const [isShare, setIsShare] = useState(false);

  const myVideo = useRef();
  const screenStreamRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const socketRef = useRef(null); // ✅ Dùng ref để lưu socket

  // Initialize socket, media stream
  useEffect(() => {
    let mounted = true;

    // ✅ Khởi tạo socket TRONG useEffect
    if (!socketRef.current) {
      console.log('🔌 Initializing socket connection...');
      socketRef.current = io('http://localhost:5000');
    }

    const socket = socketRef.current;

    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        localStreamRef.current = mediaStream;
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
        }
        console.log('✅ Media stream initialized');
      } catch (err) {
        console.error('❌ Permission error:', err);
      }
    };

    initMedia();

    socket.on('me', id => {
      console.log('🆔 My socket ID:', id);
      setMe(id);
    });

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      const peers = peersRef.current;
      Object.values(peers).forEach(peer => {
        if (peer && peer.destroy) peer.destroy();
      });
      socket.off('me');
      
      // ✅ Disconnect socket khi component unmount
      if (socketRef.current) {
        console.log('🔌 Disconnecting socket...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join room when stream is ready
  useEffect(() => {
    if (!stream || !roomId || !socketRef.current) return;

    const socket = socketRef.current;

    console.log('🚪 Joining room:', roomId);
    socket.emit('joinRoom', { roomId, name: myName });

    socket.off('allUsers');
    socket.off('userJoined');
    socket.off('signal');
    socket.off('userLeft');

    socket.on('allUsers', users => {
      console.log('👥 All users in room:', users);
      
      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          console.log('🤝 Creating INITIATOR peer for:', userId);
          const peer = createPeer(userId, stream, socket);
          peersRef.current[userId] = peer;
          setGroupPeers(prev => {
            if (prev.find(p => p.id === userId)) return prev;
            return [...prev, { id: userId, peer }];
          });
        }
      });
    });

    socket.on('userJoined', ({ id, name }) => {
      console.log('🆕 User joined:', id, name);
    });

    socket.on('signal', ({ from, signal }) => {
      console.log('📡 Received signal from:', from, 'Type:', signal.type || 'candidate');
      
      const existingPeer = peersRef.current[from];
      
      try {
        if (existingPeer) {
          if (signal && signal.sdp && signal.type === 'answer') {
            if (existingPeer._pc && existingPeer._pc.signalingState === 'stable') {
              console.warn('⚠️ Ignoring duplicate answer from', from);
              return;
            }
          }
          
          console.log('✅ Signaling existing peer');
          existingPeer.signal(signal);
        } else {
          console.log('🆕 Creating NON-INITIATOR peer for:', from);
          const peer = addPeer(signal, from, stream, socket);
          peersRef.current[from] = peer;
          setGroupPeers(prev => {
            if (prev.find(p => p.id === from)) return prev;
            return [...prev, { id: from, peer }];
          });
        }
      } catch (err) {
        console.error('❌ Error handling signal:', err);
      }
    });

    socket.on('userLeft', id => {
      console.log('👋 User left:', id);
      if (peersRef.current[id]) {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
      }
      setGroupPeers(prev => prev.filter(user => user.id !== id));
    });

    return () => {
      console.log('🚪 Leaving room');
      socket.emit('leaveRoom');
      socket.off('allUsers');
      socket.off('userJoined');
      socket.off('signal');
      socket.off('userLeft');
    };
  }, [stream, roomId, myName]);

  const createPeer = (userId, stream, socket) => {
    const peer = new SimplePeer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', signal => {
      console.log('📤 Sending signal to:', userId);
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ Connected to:', userId);
    });

    peer.on('error', err => {
      console.error('❌ Peer error with', userId, ':', err);
    });

    return peer;
  };

  const addPeer = (incomingSignal, userId, stream, socket) => {
    const peer = new SimplePeer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', signal => {
      console.log('📤 Sending response signal to:', userId);
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ Connected to:', userId);
    });

    peer.on('error', err => {
      console.error('❌ Peer error with', userId, ':', err);
    });

    if (incomingSignal) {
      peer.signal(incomingSignal);
    }

    return peer;
  };

  const GroupVideo = ({ peer, userId }) => {
    const ref = useRef();
    const [hasStream, setHasStream] = useState(false);

    useEffect(() => {
      const handleStream = stream => {
        console.log('🎥 Received stream from peer:', userId);
        if (ref.current) {
          ref.current.srcObject = stream;
          setHasStream(true);
        }
      };

      peer.on('stream', handleStream);

      return () => {
        peer.off('stream', handleStream);
      };
    }, [peer, userId]);

    return (
      <div className="relative">
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-64 h-48 rounded-lg shadow-md bg-gray-800 object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
          {hasStream ? '🟢' : '🔴'} Peer {userId.slice(0, 6)}
        </div>
      </div>
    );
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = screenStream;
      
      if (myVideo.current) {
        myVideo.current.srcObject = screenStream;
      }
      setIsShare(true);

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      
      Object.values(peersRef.current).forEach(peer => {
        if (peer && peer._pc) {
          const senders = peer._pc.getSenders ? peer._pc.getSenders() : [];
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack)
              .catch(err => console.warn('replaceTrack failed', err));
          }
        }
      });

      screenVideoTrack.onended = stopScreenShare;
    } catch (err) {
      console.error('getDisplayMedia error:', err);
    }
  };

  const stopScreenShare = () => {
    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    const cam = localStreamRef.current;
    if (myVideo.current) {
      myVideo.current.srcObject = cam || null;
    }
    setIsShare(false);

    const camTrack = cam ? cam.getVideoTracks()[0] : null;
    
    if (camTrack) {
      Object.values(peersRef.current).forEach(peer => {
        if (peer && peer._pc) {
          const senders = peer._pc.getSenders ? peer._pc.getSenders() : [];
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(camTrack)
              .catch(err => console.warn('replaceTrack failed', err));
          }
        }
      });
    }
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Meeting Room: {roomId}
      </h1>
      
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="relative">
            <video
              ref={myVideo}
              playsInline
              autoPlay
              muted
              className="w-64 h-48 rounded-lg shadow-md bg-gray-800 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
              🟢 You ({myName})
            </div>
          </div>

          {groupPeers.map(({ id, peer }) => (
            <GroupVideo key={id} peer={peer} userId={id} />
          ))}
        </div>

        {groupPeers.length === 0 && (
          <p className="text-gray-400 text-sm">
            Waiting for others to join... Share the Room ID!
          </p>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => copyToClipboard(roomId)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            📋 Copy Room ID
          </button>
          
          {isShare ? (
            <button
              onClick={stopScreenShare}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              🛑 Stop Sharing
            </button>
          ) : (
            <button
              onClick={shareScreen}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              🖥️ Share Screen
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Your ID: {me.slice(0, 8)}... | Total Participants: {groupPeers.length + 1} | Active Connections: {Object.keys(peersRef.current).length}
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;