import { useEffect, useState } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';

export const usePeerConnections = (
  socket,
  stream,
  roomId,
  myName,
  isSharingRef,
  screenStreamRef,
  peersRef // ✅ RECEIVE peersRef instead of creating new one
) => {
  const [groupPeers, setGroupPeers] = useState([]);
  const [peersSharingScreen, setPeersSharingScreen] = useState(new Set());
  // ✅ REMOVED: const peersRef = useRef({});

  const createPeer = (userId, stream, socket) => {
    // CRITICAL: Check if screen sharing is active
    const isCurrentlySharing = isSharingRef.current;
    const screenStream = screenStreamRef.current;

    console.log('⚙️ Creating initiator peer for:', userId.slice(0, 6));
    console.log('🔍 Check sharing status:');
    console.log('   isSharingRef.current:', isCurrentlySharing);
    console.log('   screenStreamRef.current:', !!screenStream);

    // Use screen stream if actively sharing, otherwise use camera
    const currentStream =
      isCurrentlySharing && screenStream ? screenStream : stream;

    console.log(
      '📹 Stream type:',
      isCurrentlySharing && screenStream ? '🖥️ SCREEN SHARE' : '📷 CAMERA'
    );
    console.log(
      '📹 Stream has video tracks:',
      currentStream?.getVideoTracks().length || 0
    );

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream: currentStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', signal => {
      console.log('📤 Sending signal to:', userId.slice(0, 6));
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () =>
      console.log('✅ Connected to:', userId.slice(0, 6))
    );
    peer.on('stream', () =>
      console.log('🎥 Received stream from:', userId.slice(0, 6))
    );
    peer.on('error', err =>
      console.error('❌ Peer error:', userId.slice(0, 6), err.message)
    );
    peer.on('close', () => console.log('🔒 Peer closed:', userId.slice(0, 6)));

    return peer;
  };

  const addPeer = (incomingSignal, userId, stream, socket) => {
    console.log('⚙️ Creating non-initiator peer for:', userId.slice(0, 6));

    const peer = new SimplePeer({
      initiator: false,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', signal => {
      console.log('📤 Sending response signal to:', userId.slice(0, 6));
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () =>
      console.log('✅ Connected to:', userId.slice(0, 6))
    );
    peer.on('stream', () =>
      console.log('🎥 Received stream from:', userId.slice(0, 6))
    );
    peer.on('error', err =>
      console.error('❌ Peer error:', userId.slice(0, 6), err.message)
    );
    peer.on('close', () => console.log('🔒 Peer closed:', userId.slice(0, 6)));

    if (incomingSignal) {
      peer.signal(incomingSignal);
    }

    return peer;
  };

  useEffect(() => {
    if (!stream || !roomId || !socket) return;

    console.log('🚪 Joining room:', roomId, 'as', myName);
    socket.emit('joinRoom', { roomId, name: myName });

    socket.off('allUsers');
    socket.off('userJoined');
    socket.off('signal');
    socket.off('userLeft');
    socket.off('peerScreenShareStatus');

    socket.on('allUsers', users => {
      console.log('👥 All users in room:', users);
      console.log('🔍 Before creating peers - sharing state:', {
        isSharingRef: isSharingRef.current,
        hasScreenStream: !!screenStreamRef.current,
      });

      users.forEach(userId => {
        if (!peersRef.current[userId]) {
          console.log('🤝 Creating INITIATOR peer for:', userId.slice(0, 6));
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
      // Nếu đang share thì re-send track
      if (isSharingRef.current && screenStreamRef.current) {
        console.log(`📺 Re-sending screen to ${id.slice(0, 6)}`);
        const peer = peersRef.current[id];
        if (peer && peer._pc) {
          const screenTrack = screenStreamRef.current.getVideoTracks()[0];
          const sender = peer._pc
            .getSenders()
            .find(s => s.track?.kind === 'video');
          if (sender && screenTrack) {
            sender
              .replaceTrack(screenTrack)
              .then(() => console.log(`✅ Screen sent to ${id.slice(0, 6)}`))
              .catch(err => console.error('❌ Screen send error:', err));
          }
        }
      }
    });

    socket.on('signal', ({ from, signal }) => {
      console.log(
        '📡 Signal from:',
        from.slice(0, 6),
        '| Type:',
        signal.type || 'candidate'
      );

      try {
        const existingPeer = peersRef.current[from];

        if (existingPeer) {
          if (signal.type === 'answer' && signal.sdp) {
            if (existingPeer._pc?.signalingState === 'stable') {
              console.warn(
                '⚠️ Ignoring duplicate answer from',
                from.slice(0, 6)
              );
              return;
            }
          }
          existingPeer.signal(signal);
        } else {
          if (signal.type === 'offer' && signal.sdp) {
            console.log(
              '🆕 Creating NON-INITIATOR peer for:',
              from.slice(0, 6)
            );
            const peer = addPeer(signal, from, stream, socket);
            peersRef.current[from] = peer;

            setGroupPeers(prev => {
              if (prev.find(p => p.id === from)) return prev;
              return [...prev, { id: from, peer }];
            });
          }
        }
      } catch (err) {
        console.error('❌ Error processing signal:', err);
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

    socket.on('peerScreenShareStatus', ({ userId, isSharing }) => {
      console.log(
        `📺 Peer ${userId.slice(0, 6)} ${isSharing ? 'started' : 'stopped'} sharing`
      );

      setPeersSharingScreen(prev => {
        const newSet = new Set(prev);
        isSharing ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });

      if (isSharing && peersRef.current[userId]) {
        setTimeout(() => setGroupPeers(prev => [...prev]), 500);
      }
    });

    return () => {
      console.log('🚪 Leaving room');
      socket.emit('leaveRoom');
      socket.off('allUsers');
      socket.off('userJoined');
      socket.off('signal');
      socket.off('userLeft');
      socket.off('peerScreenShareStatus');
    };
  }, [stream, roomId, myName, socket]);

  // Cleanup peers on unmount
  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach(peer => {
        if (peer?.destroy) peer.destroy();
      });
    };
  }, []);

  return {
    groupPeers,
    peersRef,
    peersSharingScreen,
  };
};
