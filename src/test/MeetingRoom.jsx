import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous'; // Retrieve myName from state, fallback to 'Anonymous'
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [isShare, setIsShare] = useState(false);
  const [groupPeers, setGroupPeers] = useState([]);
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const screenStreamRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
        localStreamRef.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;
      })
      .catch(err => console.log('Permission error', err));

    socket.on('connection', () => console.log('Connected:', socket.id));
    socket.on('me', id => setMe(id));
    socket.on('callUser', data => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    joinRoom(roomId);

    return () => {
      socket.off('connect');
      socket.off('me');
      socket.off('callUser');
    };
  }, [roomId]); // Add roomId to dependency array

  useEffect(() => {
    socket.on('callEnded', () => {
      setCallEnded(true);
      setCallAccepted(false);
      setReceivingCall(false);
      if (userVideo.current) userVideo.current.srcObject = null;
      if (connectionRef.current) connectionRef.current.destroy();
    });
    return () => socket.off('callEnded');
  }, []);

  const callUser = id => {
    socket.off('callAccepted');
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', data =>
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: myName, // Use myName from location.state
      })
    );
    peer.on('stream', stream => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
        userVideo.current.muted = false;
        userVideo.current.play().catch(() => {});
      }
    });
    socket.on('callAccepted', signal => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on('signal', data =>
      socket.emit('answerCall', { signal: data, to: caller })
    );
    peer.on('stream', stream => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
        userVideo.current.muted = false;
        userVideo.current.play().catch(() => {});
      }
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    socket.emit('endCall', { to: caller || idToCall });
    if (connectionRef.current) connectionRef.current.destroy();
    socket.off('callAccepted');
    socket.off('callUser');
    if (userVideo.current) userVideo.current.srcObject = null;
    if (myVideo.current) myVideo.current.srcObject = stream;
  };

  const replaceVideoTrackOnPeer = newTrack => {
    const pcPeer = connectionRef.current;
    if (!pcPeer || !pcPeer._pc) return;
    const senders = pcPeer._pc.getSenders ? pcPeer._pc.getSenders() : [];
    const videoSender = senders.find(s => s.track && s.track.kind === 'video');
    if (videoSender) {
      videoSender
        .replaceTrack(newTrack)
        .catch(err => console.warn('replaceTrack failed', err));
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = screenStream;
      if (myVideo.current) myVideo.current.srcObject = screenStream;
      setIsShare(true);
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) replaceVideoTrackOnPeer(screenVideoTrack);
      screenVideoTrack.onended = stopScreenShare;
    } catch (err) {
      console.error('getDisplayMedia error', err);
    }
  };

  const stopScreenShare = () => {
    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    const cam = localStreamRef.current;
    if (myVideo.current) myVideo.current.srcObject = cam || null;
    setIsShare(false);
    const camTrack = cam ? cam.getVideoTracks()[0] : null;
    if (camTrack) replaceVideoTrackOnPeer(camTrack);
  };

  const joinRoom = roomId => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (myVideo.current) myVideo.current.srcObject = stream;
        localStreamRef.current = stream;
        socket.emit('joinRoom', { roomId, name: myName }); // Use myName here
        socket.off('allUsers').off('userJoined').off('signal').off('userLeft');

        socket.on('allUsers', users => {
          const peersArray = users.map(userId => {
            const peer = createPeer(userId, stream);
            peersRef.current[userId] = peer;
            return { id: userId, peer };
          });
          setGroupPeers(peersArray);
        });

        socket.on('userJoined', ({ id }) => {
          if (!peersRef.current[id]) {
            const peer = addPeer(null, id, stream);
            peersRef.current[id] = peer;
            setGroupPeers(prev => [...prev, { id, peer }]);
          }
        });

        socket.on('signal', ({ from, signal }) => {
          const existingPeer = peersRef.current[from];
          try {
            if (existingPeer) {
              // Nếu signal là SDP (offer/answer)
              if (signal && signal.sdp) {
                // signal.type có thể là 'offer' hoặc 'answer'
                const sdpType = signal.type; // thường SimplePeer cung cấp type
                // Nếu đây là một 'answer' đến khi peer đã stable => nhiều khả năng là trùng lặp -> bỏ qua
                if (
                  sdpType === 'answer' &&
                  existingPeer._pc &&
                  existingPeer._pc.signalingState === 'stable'
                ) {
                  console.warn(
                    `⚠️ Bỏ qua answer trùng từ ${from} (peer đã stable)`
                  );
                  return;
                }
                // Ngược lại (offer hoặc answer khi chưa stable) -> xử lý bình thường
                existingPeer.signal(signal);
              } else {
                // Không phải SDP => ICE candidate. An toàn để xử lý
                existingPeer.signal(signal);
              }
            } else {
              // Chưa có peer, tạo peer non-initiator và truyền incoming signal (nếu có)
              const peer = addPeer(signal, from, stream);
              peersRef.current[from] = peer;
              setGroupPeers(prev => [...prev, { id: from, peer }]);
            }
          } catch (err) {
            console.error('Lỗi khi xử lý signal:', err);
          }
        });

        socket.on('userLeft', id => {
          if (peersRef.current[id]) peersRef.current[id].destroy();
          delete peersRef.current[id];
          setGroupPeers(prev => prev.filter(user => user.id !== id));
        });
      });
  };

  const createPeer = (userId, stream) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal =>
      socket.emit('signal', { targetId: userId, signal })
    );
    return peer;
  };

  const addPeer = (incomingSignal, userId, stream) => {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal =>
      socket.emit('signal', { targetId: userId, signal })
    );
    if (incomingSignal) peer.signal(incomingSignal);
    return peer;
  };

  const GroupVideo = ({ peer }) => {
    const ref = useRef();
    useEffect(() => {
      peer.on('stream', stream => {
        if (ref.current) ref.current.srcObject = stream;
      });
    }, [peer]);
    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        className='w-64 rounded-lg shadow-md'
      />
    );
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white p-6'>
      <h1 className='text-3xl font-bold text-center mb-6'>
        Meeting Room: {roomId}
      </h1>
      <div className='flex flex-col items-center gap-6'>
        <div className='flex flex-wrap justify-center gap-4'>
          <video
            ref={myVideo}
            playsInline
            autoPlay
            muted
            className='w-64 rounded-lg shadow-md'
          />
          {callAccepted && !callEnded && (
            <video
              ref={userVideo}
              playsInline
              autoPlay
              className='w-64 rounded-lg shadow-md'
            />
          )}
          {groupPeers.map(({ id, peer }) => (
            <GroupVideo key={id} peer={peer} />
          ))}
        </div>

        <div className='flex gap-4'>
          <button
            onClick={() => copyToClipboard(roomId)}
            className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold'
          >
            Copy Room ID
          </button>
          {isShare ? (
            <button
              onClick={stopScreenShare}
              className='bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold'
            >
              🛑 Stop Sharing
            </button>
          ) : (
            <button
              onClick={shareScreen}
              className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold'
            >
              🖥️ Share Screen
            </button>
          )}
          {callAccepted && !callEnded ? (
            <button
              onClick={leaveCall}
              className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold'
            >
              End Call
            </button>
          ) : (
            <div className='flex gap-4'>
              <input
                type='text'
                placeholder='Enter ID to call'
                value={idToCall}
                onChange={e => setIdToCall(e.target.value)}
                className='px-4 py-2 rounded-lg border border-gray-300 text-black'
              />
              <button
                onClick={() => callUser(idToCall)}
                className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold'
              >
                📞 Call
              </button>
            </div>
          )}
        </div>

        {receivingCall && !callAccepted && (
          <div className='bg-gray-800 p-4 rounded-lg mt-4'>
            <h2 className='mb-2'>{callerName} is calling...</h2>
            <button
              onClick={answerCall}
              className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold'
            >
              Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRoom;
