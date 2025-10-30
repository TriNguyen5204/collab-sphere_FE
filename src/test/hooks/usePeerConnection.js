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

  const createPeer = (userId, stream, socket) => {
    const isCurrentlySharing = isSharingRef.current;
    const screenStream = screenStreamRef.current;
    const currentStream = (isCurrentlySharing && screenStream) ? screenStream : stream;

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
      if (isSharingRef.current && screenStreamRef.current) {
        const screenVideoTrack = screenStreamRef.current.getVideoTracks()[0];
        const senders = peer._pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender && screenVideoTrack) {
          videoSender.replaceTrack(screenVideoTrack).catch(()=>{});
        }
      }
    });

    peer.on('stream', () => {});
    peer.on('error', () => {});
    peer.on('close', () => {});

    return peer;
  };

  const addPeer = (incomingSignal, userId, stream, socket) => {
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

    peer.on('connect', () => {});
    peer.on('stream', () => {});
    peer.on('error', () => {});
    peer.on('close', () => {});

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

    socket.on('allUsers', users => {
      setTimeout(() => {
        users.forEach(userObj => {
          const id = typeof userObj === 'string' ? userObj : userObj.userId;
          if (!peersRef.current[id]) {
            const isPeerSharing = typeof userObj === "object" ? !!userObj.isSharing : false;
            const peer = createPeer(id, stream, socket, isPeerSharing);
            peersRef.current[id] = peer;
            setGroupPeers(prev => {
              if (prev.find(p => p.id === id)) return prev;
              return [...prev, { id, peer }];
            });
          }
        });
      }, 300);
    });

    socket.on('userJoined', ({ id }) => {});

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
      if (peersRef.current[id]) {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
      }
      setGroupPeers(prev => prev.filter(user => user.id !== id));
    });

    socket.on('peerScreenShareStatus', ({ userId, isSharing }) => {
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
