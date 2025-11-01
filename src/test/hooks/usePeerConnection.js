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
  const peersSharingScreenRef = useRef(new Set());

  const createPeer = (userId, stream, socket, isPeerSharing) => {
    console.log(`🔧 Creating peer for ${userId.slice(0,6)} | isPeerSharing: ${isPeerSharing} | I'm sharing: ${isSharingRef.current}`);
    
    const isCurrentlySharing = isSharingRef.current;
    const screenStream = screenStreamRef.current;
    const currentStream =
      isCurrentlySharing && screenStream ? screenStream : stream;

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
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ Peer connected:', userId.slice(0, 6));
      
      // Nếu MÌNH đang share screen, replace track ngay
      if (isSharingRef.current && screenStreamRef.current) {
        setTimeout(() => {
          const screenVideoTrack = screenStreamRef.current?.getVideoTracks()[0];
          const senders = peer._pc?.getSenders();
          const videoSender = senders?.find(s => s.track?.kind === 'video');
          if (videoSender && screenVideoTrack) {
            videoSender.replaceTrack(screenVideoTrack)
              .then(() => {
                console.log('🖥️✅ Sent MY screen track to peer:', userId.slice(0, 6));
              })
              .catch(err => {
                console.error('❌ Failed to send screen track:', err);
              });
          }
        }, 500);
      }
      
      // Nếu PEER đang share screen, yêu cầu họ gửi screen track (retry mechanism)
      if (isPeerSharing) {
        console.log('📢 Peer is sharing! Requesting screen track from:', userId.slice(0, 6));
        
        // Request ngay lập tức
        socket.emit('requestScreenTrack', { targetId: userId });
        
        // Retry sau 500ms
        setTimeout(() => {
          console.log('📢 Retry 1: Requesting screen track from:', userId.slice(0, 6));
          socket.emit('requestScreenTrack', { targetId: userId });
        }, 500);
        
        // Retry sau 1000ms
        setTimeout(() => {
          console.log('📢 Retry 2: Requesting screen track from:', userId.slice(0, 6));
          socket.emit('requestScreenTrack', { targetId: userId });
        }, 1000);
        
        // Retry sau 2000ms
        setTimeout(() => {
          console.log('📢 Retry 3: Requesting screen track from:', userId.slice(0, 6));
          socket.emit('requestScreenTrack', { targetId: userId });
        }, 2000);
      }
    });

    peer.on('stream', () => {});
    peer.on('error', err => {
      console.error('❌ Peer error:', userId.slice(0, 6), err);
    });
    peer.on('close', () => {
      console.log('🔌 Peer closed:', userId.slice(0, 6));
    });

    return peer;
  };

  const addPeer = (incomingSignal, userId, stream, socket) => {
    console.log(`🔧 Adding peer (non-initiator) for ${userId.slice(0,6)}`);
    
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
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ Peer connected (non-initiator):', userId.slice(0, 6));
      
      // Nếu mình đang share, gửi screen track
      if (isSharingRef.current && screenStreamRef.current) {
        setTimeout(() => {
          const screenVideoTrack = screenStreamRef.current?.getVideoTracks()[0];
          const senders = peer._pc?.getSenders();
          const videoSender = senders?.find(s => s.track?.kind === 'video');
          if (videoSender && screenVideoTrack) {
            videoSender.replaceTrack(screenVideoTrack)
              .then(() => {
                console.log('🖥️✅ Sent MY screen track to non-initiator peer:', userId.slice(0, 6));
              })
              .catch(err => {
                console.error('❌ Failed to send screen track to non-initiator:', err);
              });
          }
        }, 500);
      }
    });
    
    peer.on('stream', () => {});
    peer.on('error', err => {
      console.error('❌ Non-initiator peer error:', userId.slice(0, 6), err);
    });
    peer.on('close', () => {
      console.log('🔌 Non-initiator peer closed:', userId.slice(0, 6));
    });

    if (incomingSignal) peer.signal(incomingSignal);

    return peer;
  };

  useEffect(() => {
    if (!stream || !roomId || !socket || !mySocketId) return;

    socket.emit('joinRoom', { roomId, name: myName });

    socket.off('allUsers');
    socket.off('userJoined');
    socket.off('signal');
    socket.off('userLeft');
    socket.off('peerScreenShareStatus');
    socket.off('requestScreenTrack');

    socket.on('allUsers', ({ usersInRoom, usersSharing }) => {
      console.log('📋 Received allUsers:', {
        usersInRoom: usersInRoom?.map(u => u.id.slice(0,6)),
        usersSharing: usersSharing?.map(id => id.slice(0,6))
      });
      
      (usersInRoom || []).forEach(user => {
        const id = user.id;
        const isPeerSharing = usersSharing ? usersSharing.includes(id) : false;

        console.log(`👤 Processing user ${id.slice(0,6)} | Sharing: ${isPeerSharing}`);

        if (!peersRef.current[id]) {
          const peer = createPeer(id, stream, socket, isPeerSharing);
          peersRef.current[id] = peer;

          setGroupPeers(prev => {
            if (prev.find(p => p.id === id)) return prev;
            return [...prev, { id, peer }];
          });
        }
      });

      const sharingSet = new Set(usersSharing || []);
      peersSharingScreenRef.current = sharingSet;
      setPeersSharingScreen(sharingSet);
    });

    socket.on('userJoined', ({ id }) => {
      console.log('👤 New user joined:', id.slice(0, 6));
      
      // Nếu MÌNH đang share screen, cần gửi screen track cho user mới
      if (isSharingRef.current && screenStreamRef.current) {
        console.log('🖥️ I am sharing! Will send screen track to new user...');
        
        // Retry với nhiều lần để đảm bảo
        [500, 1000, 1500, 2000].forEach(delay => {
          setTimeout(() => {
            const peer = peersRef.current[id];
            if (peer && peer._pc && screenStreamRef.current) {
              const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
              const senders = peer._pc.getSenders();
              const videoSender = senders.find(s => s.track?.kind === 'video');
              if (videoSender && screenVideoTrack) {
                videoSender.replaceTrack(screenVideoTrack)
                  .then(() => {
                    console.log(`🖥️✅ Screen track sent to new user (${delay}ms):`, id.slice(0, 6));
                  })
                  .catch(err => {
                    console.error(`❌ Failed to send screen track (${delay}ms):`, err);
                  });
              }
            }
          }, delay);
        });
      }
    });

    // Handler khi nhận yêu cầu gửi screen track
    socket.on('requestScreenTrack', ({ requesterId }) => {
      console.log('📨 Received request for screen track from:', requesterId.slice(0, 6));
      console.log('   Am I sharing?', isSharingRef.current);
      console.log('   Screen stream exists?', !!screenStreamRef.current);
      
      if (isSharingRef.current && screenStreamRef.current && peersRef.current[requesterId]) {
        const peer = peersRef.current[requesterId];
        console.log('   Peer exists?', !!peer);
        console.log('   Peer PC exists?', !!peer?._pc);
        
        if (peer && peer._pc) {
          const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
          const senders = peer._pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          
          console.log('   Screen video track:', screenVideoTrack?.id.slice(0, 8));
          console.log('   Video sender exists?', !!videoSender);
          console.log('   Current track:', videoSender?.track?.id.slice(0, 8));
          
          if (videoSender && screenVideoTrack) {
            videoSender.replaceTrack(screenVideoTrack)
              .then(() => {
                console.log('✅✅✅ Screen track sent on request to:', requesterId.slice(0, 6));
              })
              .catch(err => {
                console.error('❌ Failed to replace track:', err);
              });
          }
        }
      } else {
        console.log('⚠️ Cannot send screen track - conditions not met');
      }
    });

    socket.on('signal', ({ from, signal }) => {
      try {
        const existingPeer = peersRef.current[from];
        if (existingPeer) {
          if (signal.type === 'answer' && signal.sdp) {
            if (existingPeer._pc?.signalingState === 'stable') return;
          }
          existingPeer.signal(signal);
        } else {
          if (signal.type === 'offer' && signal.sdp) {
            const peer = addPeer(signal, from, stream, socket);
            peersRef.current[from] = peer;
            setGroupPeers(prev => {
              if (prev.find(p => p.id === from)) return prev;
              return [...prev, { id: from, peer }];
            });
          }
        }
      } catch (err) {
        console.error('Error handling signal:', err);
      }
    });

    socket.on('userLeft', id => {
      console.log('👋 User left:', id.slice(0, 6));
      if (peersRef.current[id]) {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
      }
      setGroupPeers(prev => prev.filter(user => user.id !== id));
    });

    socket.on('peerScreenShareStatus', ({ userId, isSharing }) => {
      console.log(`🖥️ Screen share status from ${userId.slice(0,6)}: ${isSharing ? 'STARTED' : 'STOPPED'}`);
      
      const newSet = new Set(peersSharingScreenRef.current);
      if (isSharing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      peersSharingScreenRef.current = newSet;
      setPeersSharingScreen(newSet);

      if (userId === mySocketId) {
        isSharingRef.current = isSharing;
      }
      
      if (isSharing && peersRef.current[userId]) {
        setTimeout(() => {
          setGroupPeers(prev => [...prev]);
        }, 500);
      }
    });

    return () => {
      socket.emit('leaveRoom');
      socket.off('allUsers');
      socket.off('userJoined');
      socket.off('signal');
      socket.off('userLeft');
      socket.off('peerScreenShareStatus');
      socket.off('requestScreenTrack');
    };
  }, [stream, roomId, myName, socket, mySocketId]);

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