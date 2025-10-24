import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import io from 'socket.io-client';

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
  const socketRef = useRef(null);

  // Initialize socket and media ONCE
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (socketRef.current) return;

    console.log('🔌 Initializing socket connection...');
    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Get media stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(mediaStream => {
        console.log('✅ Media stream initialized');
        setStream(mediaStream);
        localStreamRef.current = mediaStream;
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
        }
      })
      .catch(err => console.error('❌ Permission error:', err));

    socket.on('me', id => {
      console.log('🆔 My socket ID:', id);
      setMe(id);
    });

    // Cleanup only on real unmount
    return () => {
      console.log('🧹 Component cleanup');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => {
        if (peer && peer.destroy) peer.destroy();
      });
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join room when stream is ready
  useEffect(() => {
    if (!stream || !roomId || !socketRef.current) return;

    const socket = socketRef.current;

    console.log('🚪 Joining room:', roomId, 'as', myName);
    socket.emit('joinRoom', { roomId, name: myName });

    // Clean up old listeners
    socket.off('allUsers');
    socket.off('userJoined');
    socket.off('signal');
    socket.off('userLeft');

    // When joining, I get list of existing users
    socket.on('allUsers', users => {
      console.log('👥 Existing users in room:', users);

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

    // When a new user joins, they will send me an offer
    socket.on('userJoined', ({ id, name }) => {
      console.log('🆕 New user joined:', id, name);
      // Don't create peer yet, wait for their signal
    });

    // Handle incoming signals
    socket.on('signal', ({ from, signal }) => {
      console.log(
        '📡 Signal from:',
        from.slice(0, 6),
        '| Type:',
        signal.type || 'candidate',
        '| Has SDP:',
        !!signal.sdp
      );

      try {
        const existingPeer = peersRef.current[from];

        if (existingPeer) {
          // Already have a peer connection
          console.log('✅ Using existing peer for:', from.slice(0, 6));

          // Safety check for duplicate answers
          if (signal.type === 'answer' && signal.sdp) {
            if (
              existingPeer._pc &&
              existingPeer._pc.signalingState === 'stable'
            ) {
              console.warn(
                '⚠️ Ignoring duplicate answer from',
                from.slice(0, 6)
              );
              return;
            }
          }

          existingPeer.signal(signal);
        } else {
          // New peer connection - check if this is an offer (new connection)
          if (signal.type === 'offer' && signal.sdp) {
            console.log(
              '🆕 Creating NON-INITIATOR peer for:',
              from.slice(0, 6)
            );
            const peer = addPeer(signal, from, stream, socket);
            peersRef.current[from] = peer;

            // Only update state once to avoid re-renders
            setGroupPeers(prev => {
              // Check if already exists
              const exists = prev.find(p => p.id === from);
              if (exists) {
                console.log('⚠️ Peer already in list:', from.slice(0, 6));
                return prev;
              }
              console.log('➕ Adding peer to list:', from.slice(0, 6));
              return [...prev, { id: from, peer }];
            });
          } else {
            console.warn(
              '⚠️ Received non-offer signal for unknown peer:',
              from.slice(0, 6)
            );
          }
        }
      } catch (err) {
        console.error(
          '❌ Error processing signal from',
          from.slice(0, 6),
          ':',
          err
        );
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

    // Listen for screen share status from other users
    socket.on('peerScreenShareStatus', ({ userId, isSharing }) => {
      console.log(
        `📺 Peer ${userId.slice(0, 6)} ${isSharing ? 'started' : 'stopped'} screen sharing`
      );
      // When someone starts sharing, their video track automatically updates
      // No need to do anything special - SimplePeer handles it
    });

    return () => {
      console.log('🚪 Cleaning up room listeners');
      socket.emit('leaveRoom');
      socket.off('allUsers');
      socket.off('userJoined');
      socket.off('signal');
      socket.off('userLeft');
    };
  }, [stream, roomId, myName]);

  const createPeer = (userId, stream, socket) => {
    console.log('⚙️ Creating initiator peer for:', userId);
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', signal => {
      console.log('📤 Sending', signal.type || 'candidate', 'to:', userId);
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ CONNECTED to:', userId);
    });

    peer.on('stream', remoteStream => {
      console.log('🎥 Received STREAM from:', userId);
    });

    peer.on('error', err => {
      console.error('❌ Peer error with', userId, ':', err.message);
    });

    peer.on('close', () => {
      console.log('🔒 Peer closed:', userId);
    });

    return peer;
  };

  const addPeer = (incomingSignal, userId, stream, socket) => {
    console.log('⚙️ Creating non-initiator peer for:', userId);
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', signal => {
      console.log('📤 Sending', signal.type || 'candidate', 'to:', userId);
      socket.emit('signal', { targetId: userId, signal });
    });

    peer.on('connect', () => {
      console.log('✅ CONNECTED to:', userId);
    });

    peer.on('stream', remoteStream => {
      console.log('🎥 Received STREAM from:', userId);
    });

    peer.on('error', err => {
      console.error('❌ Peer error with', userId, ':', err.message);
    });

    peer.on('close', () => {
      console.log('🔒 Peer closed:', userId);
    });

    // Signal with the incoming offer
    if (incomingSignal) {
      console.log(
        '🔄 Signaling incoming',
        incomingSignal.type,
        'from:',
        userId
      );
      peer.signal(incomingSignal);
    }

    return peer;
  };

  const GroupVideo = ({ peer, userId }) => {
    const ref = useRef();
    const [hasStream, setHasStream] = useState(false);
    const streamHandledRef = useRef(false);

    useEffect(() => {
      if (streamHandledRef.current) {
        console.log('⚠️ Stream handler already set for:', userId.slice(0, 6));
        return;
      }

      streamHandledRef.current = true;

      const handleStream = stream => {
        console.log('🎥 GroupVideo received stream from:', userId.slice(0, 6));
        if (ref.current && ref.current.srcObject !== stream) {
          ref.current.srcObject = stream;
          setHasStream(true);
        }
      };

      peer.on('stream', handleStream);

      // Check if stream already exists
      if (peer.streams && peer.streams.length > 0) {
        console.log('🎥 Stream already exists for:', userId.slice(0, 6));
        handleStream(peer.streams[0]);
      }

      return () => {
        console.log('🧹 Cleaning up stream listener for:', userId.slice(0, 6));
        peer.off('stream', handleStream);
        streamHandledRef.current = false;
      };
    }, [peer, userId]);

    return (
      <div className='relative'>
        <video
          ref={ref}
          autoPlay
          playsInline
          className='w-64 h-48 rounded-lg shadow-md bg-gray-800 object-cover'
        />
        <div className='absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs'>
          {hasStream ? '🟢' : '🔴'} Peer {userId.slice(0, 6)}
        </div>
      </div>
    );
  };

  const shareScreen = async () => {
    if (!socketRef.current) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false, // Disable screen audio to avoid issues
      });

      console.log('🖥️ Screen share started');
      screenStreamRef.current = screenStream;

      // Update my local video
      if (myVideo.current) {
        myVideo.current.srcObject = screenStream;
      }
      setIsShare(true);

      // Notify others
      socketRef.current.emit('screenShareStatus', {
        roomId,
        isSharing: true,
      });

      const screenVideoTrack = screenStream.getVideoTracks()[0];

      // Replace video track for all existing peers
      console.log('🔄 Replacing video tracks with screen...');
      let successCount = 0;
      let failCount = 0;

      Object.entries(peersRef.current).forEach(([userId, peer]) => {
        if (!peer || !peer._pc) {
          console.warn(`⚠️ No peer connection for ${userId.slice(0, 6)}`);
          return;
        }

        try {
          const senders = peer._pc.getSenders();
          const videoSender = senders.find(
            s => s.track && s.track.kind === 'video'
          );

          if (videoSender) {
            videoSender
              .replaceTrack(screenVideoTrack)
              .then(() => {
                console.log(`✅ Screen video sent to ${userId.slice(0, 6)}`);
                successCount++;
              })
              .catch(err => {
                console.error(
                  `❌ Failed to send video to ${userId.slice(0, 6)}:`,
                  err
                );
                failCount++;
              });
          } else {
            console.warn(`⚠️ No video sender for ${userId.slice(0, 6)}`);
            failCount++;
          }
        } catch (err) {
          console.error(
            `❌ Error replacing track for ${userId.slice(0, 6)}:`,
            err
          );
          failCount++;
        }
      });

      setTimeout(() => {
        console.log(
          `📊 Screen share results: ${successCount} success, ${failCount} failed`
        );
      }, 1000);

      // Auto-stop when user stops sharing
      screenVideoTrack.onended = () => {
        console.log('🛑 Screen share ended by user');
        stopScreenShare();
      };
    } catch (err) {
      console.error('❌ getDisplayMedia error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Screen sharing permission denied');
      }
    }
  };

  const stopScreenShare = () => {
    if (!socketRef.current) return;

    console.log('🛑 Stopping screen share');

    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Stopped track:', track.kind);
      });
      screenStreamRef.current = null;
    }

    // Restore camera stream locally
    const cam = localStreamRef.current;
    if (myVideo.current && cam) {
      myVideo.current.srcObject = cam;
    }
    setIsShare(false);

    // Notify others
    socketRef.current.emit('screenShareStatus', {
      roomId,
      isSharing: false,
    });

    if (!cam) {
      console.error('❌ No camera stream available');
      return;
    }

    const camVideoTrack = cam.getVideoTracks()[0];
    if (!camVideoTrack) {
      console.error('❌ No camera video track');
      return;
    }

    // Restore camera track for all peers
    console.log('🔄 Restoring camera video tracks...');
    let successCount = 0;
    let failCount = 0;

    Object.entries(peersRef.current).forEach(([userId, peer]) => {
      if (!peer || !peer._pc) {
        console.warn(`⚠️ No peer connection for ${userId.slice(0, 6)}`);
        return;
      }

      try {
        const senders = peer._pc.getSenders();
        const videoSender = senders.find(
          s => s.track && s.track.kind === 'video'
        );

        if (videoSender) {
          videoSender
            .replaceTrack(camVideoTrack)
            .then(() => {
              console.log(`✅ Camera restored for ${userId.slice(0, 6)}`);
              successCount++;
            })
            .catch(err => {
              console.error(
                `❌ Failed to restore for ${userId.slice(0, 6)}:`,
                err
              );
              failCount++;
            });
        } else {
          console.warn(`⚠️ No video sender for ${userId.slice(0, 6)}`);
          failCount++;
        }
      } catch (err) {
        console.error(
          `❌ Error restoring track for ${userId.slice(0, 6)}:`,
          err
        );
        failCount++;
      }
    });

    setTimeout(() => {
      console.log(
        `📊 Camera restore results: ${successCount} success, ${failCount} failed`
      );
    }, 1000);
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio:', audioTrack.enabled ? 'ON' : 'OFF');
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video:', videoTrack.enabled ? 'ON' : 'OFF');
      }
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white'>
      {/* Header */}
      <div className='bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Meeting Room
            </h1>
            <p className='text-sm text-gray-400 mt-1'>Room ID: {roomId}</p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-sm text-gray-300'>
                {groupPeers.length + 1} participant
                {groupPeers.length !== 0 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(roomId)}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2'
            >
              <span>📋</span>
              <span>Copy Room ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Video Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'>
          {/* My Video */}
          <div className='relative group'>
            <div className='relative aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-blue-500/50'>
              <video
                ref={myVideo}
                playsInline
                autoPlay
                muted
                className='w-full h-full object-cover'
              />
              {/* Overlay */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none'></div>
              {/* Name Badge */}
              <div className='absolute bottom-3 left-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-sm font-semibold text-white drop-shadow-lg'>
                  You ({myName})
                </span>
              </div>
              {/* Screen Share Indicator */}
              {isShare && (
                <div className='absolute top-3 right-3 px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse'>
                  🖥️ Sharing
                </div>
              )}
            </div>
          </div>

          {/* Other Participants */}
          {groupPeers.map(({ id, peer }) => (
            <GroupVideo key={id} peer={peer} userId={id} />
          ))}
        </div>

        {/* Empty State */}
        {groupPeers.length === 0 && (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4'>
              <span className='text-3xl'>👥</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-300 mb-2'>
              Waiting for others to join...
            </h3>
            <p className='text-gray-500'>
              Share the Room ID to invite participants
            </p>
          </div>
        )}

        {/* Control Bar */}
        <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50'>
          <div className='bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 px-6 py-4'>
            <div className='flex items-center gap-3'>
              {/* Microphone */}
              <button
                onClick={toggleAudio}
                className='w-12 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center'
                title='Toggle Microphone'
              >
                <span className='text-xl'>🎤</span>
              </button>

              {/* Camera */}
              <button
                onClick={toggleVideo}
                className='w-12 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center'
                title='Toggle Camera'
              >
                <span className='text-xl'>📹</span>
              </button>

              {/* Divider */}
              <div className='w-px h-8 bg-gray-600'></div>

              {/* Screen Share */}
              {isShare ? (
                <button
                  onClick={stopScreenShare}
                  className='px-6 h-12 rounded-xl bg-red-600 hover:bg-red-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-2 font-semibold'
                >
                  <span>🛑</span>
                  <span>Stop Sharing</span>
                </button>
              ) : (
                <button
                  onClick={shareScreen}
                  className='px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-2 font-semibold'
                >
                  <span>🖥️</span>
                  <span>Share Screen</span>
                </button>
              )}

              {/* Divider */}
              <div className='w-px h-8 bg-gray-600'></div>

              {/* Leave Button */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave this meeting?')) {
                    window.location.href = '/';
                  }
                }}
                className='w-12 h-12 rounded-xl bg-red-600 hover:bg-red-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center'
                title='Leave Meeting'
              >
                <span className='text-xl'>📞</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className='text-center mt-8 text-sm text-gray-500'>
          Your ID: {me.slice(0, 8)}... | Connections:{' '}
          {Object.keys(peersRef.current).length}
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
