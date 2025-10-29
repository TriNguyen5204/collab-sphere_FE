import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';

export const usePeerConnections = (
  socket,
  stream,
  roomId,
  myName,
  isSharingRef,
  screenStreamRef,
  peersRef,
  mySocketId
) => {
  const [groupPeers, setGroupPeers] = useState([]);
  const [peersSharingScreen, setPeersSharingScreen] = useState(new Set());
  const peersSharingScreenRef = useRef(new Set()); // ✅ Add ref for immediate access

  const createPeer = (userId, stream, socket, isPeerSharing = false) => {
    // ✅ CRITICAL: If the PEER (not me!) is sharing, we DON'T use screen stream
    // We just create a normal peer and THEY will send their screen to us
    // The isPeerSharing param is just for logging/tracking

    // Check if I'M sharing (use my screen stream)
    const isCurrentlySharing = isSharingRef.current;
    const screenStream = screenStreamRef.current;

    console.log('⚙️ Creating initiator peer for:', userId.slice(0, 6));
    console.log('🔍 Check sharing status:');
    console.log('   AM I sharing? isSharingRef.current:', isCurrentlySharing);
    console.log('   Do I have screenStream?:', !!screenStream);
    console.log('   Is PEER sharing? (info only):', isPeerSharing);

    // Use MY screen stream if I'M sharing, otherwise use camera
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

    peer.on('connect', () => {
      console.log('✅ Connected to:', userId.slice(0, 6));

      // ✅ CRITICAL: If I'm sharing screen when peer connects, replace track immediately
      if (isSharingRef.current && screenStreamRef.current) {
        console.log(
          '🔄 I am sharing! Need to replace track for new peer:',
          userId.slice(0, 6)
        );
        console.log('   isSharingRef:', isSharingRef.current);
        console.log('   screenStreamRef:', !!screenStreamRef.current);

        const replaceTrack = () => {
          const screenVideoTrack = screenStreamRef.current?.getVideoTracks()[0];
          if (!peer._pc) {
            console.warn('   ⚠️ No peer._pc yet');
            return false;
          }
          if (!screenVideoTrack) {
            console.warn('   ⚠️ No screen video track');
            return false;
          }

          const senders = peer._pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');

          if (videoSender) {
            console.log('   ✅ Found video sender, replacing...');
            videoSender
              .replaceTrack(screenVideoTrack)
              .then(() =>
                console.log(
                  `   ✅ Screen track replaced for new peer: ${userId.slice(0, 6)}`
                )
              )
              .catch(err =>
                console.error(`   ❌ Failed to replace track:`, err.message)
              );
            return true;
          } else {
            console.warn('   ⚠️ No video sender found');
            return false;
          }
        };

        // Try immediately
        if (!replaceTrack()) {
          // Retry after delay
          setTimeout(() => {
            console.log('   🔄 Retrying track replacement...');
            replaceTrack();
          }, 300);
        }
      } else {
        console.log('   ℹ️ Not sharing screen, no need to replace track');
      }
    });
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

    // ✅ CRITICAL: Wait for mySocketId to be available
    if (!mySocketId) {
      console.log('⏳ Waiting for socket ID before joining room...');
      return;
    }

    console.log(
      '🚪 Joining room:',
      roomId,
      'as',
      myName,
      '| My ID:',
      mySocketId.slice(0, 6)
    );
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

      setTimeout(() => {
        console.log(
          '⏰ Now creating peers after waiting for screen share status...'
        );
        console.log('🔍 Updated sharing state:', {
          isSharingRef: isSharingRef.current,
          hasScreenStream: !!screenStreamRef.current,
        });

        // ✅ Use ref instead of state for immediate access
        const currentSharers = Array.from(peersSharingScreenRef.current);
        console.log(
          '📊 Peers sharing screen:',
          currentSharers.map(id => id.slice(0, 6))
        );

        users.forEach(userId => {
          if (!peersRef.current[userId]) {
            console.log(
              `\n🤝 Creating INITIATOR peer for: ${userId.slice(0, 6)}`
            );

            // ✅ Check ref instead of state
            const isPeerSharing = peersSharingScreenRef.current.has(userId);
            console.log(
              `   Is ${userId.slice(0, 6)} sharing? ${isPeerSharing}`
            );

            // Trong hàm tạo peer cho user mới, ở phía user đang share màn hình
            const trueStream =
              isSharingRef.current && screenStreamRef.current
                ? screenStreamRef.current
                : stream;

            // Thêm log label để chắc chắn đang lấy stream màn hình
            console.log(
              '[FIX] TẠO PEER track label:',
              trueStream?.getVideoTracks()?.[0]?.label
            );

            const peer = createPeer(userId, trueStream, socket, isPeerSharing);

            peersRef.current[userId] = peer;
            setGroupPeers(prev => {
              if (prev.find(p => p.id === userId)) return prev;
              return [...prev, { id: userId, peer }];
            });
          }
        });
      }, 300);
    });

    socket.on('userJoined', ({ id, name }) => {
      console.log('🆕 User joined:', id.slice(0, 6), name);
      console.log('   Current isSharingRef:', isSharingRef.current);
      console.log('   Current screenStreamRef:', !!screenStreamRef.current);
      console.log(
        '   Current peersRef keys:',
        Object.keys(peersRef.current).map(k => k.slice(0, 6))
      );
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
      console.log(`   My socket ID: ${mySocketId?.slice(0, 6) || 'unknown'}`);
      console.log(`   Is this me? ${userId === mySocketId}`);

      // ✅ Update BOTH state and ref
      const newSet = new Set(peersSharingScreenRef.current);
      if (isSharing) {
        newSet.add(userId);
        console.log(`   ✅ Added ${userId.slice(0, 6)} to sharing set`);
      } else {
        newSet.delete(userId);
        console.log(`   ❌ Removed ${userId.slice(0, 6)} from sharing set`);
      }

      peersSharingScreenRef.current = newSet; // ✅ Update ref immediately
      setPeersSharingScreen(newSet); // Update state for UI

      console.log(`   📊 Total sharers:`, newSet.size);
      console.log(
        `   📋 Sharers list:`,
        Array.from(newSet).map(id => id.slice(0, 6))
      );

      // If this is about ME
      if (userId === mySocketId) {
        console.log('🔄 This is MY sharing status, updating MY refs');
        isSharingRef.current = isSharing;
        console.log('✅ Updated isSharingRef.current:', isSharingRef.current);
      } else {
        console.log(`ℹ️ This is about peer ${userId.slice(0, 6)}, not me`);
      }

      // Force refresh if peer already exists
      if (isSharing && peersRef.current[userId]) {
        setTimeout(() => {
          setGroupPeers(prev => [...prev]);
          console.log(
            '🔄 Triggered video refresh for peer:',
            userId.slice(0, 6)
          );
        }, 500);
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
  }, [stream, roomId, myName, socket, mySocketId]); // ✅ Add mySocketId to deps

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
