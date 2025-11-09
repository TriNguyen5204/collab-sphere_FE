import { useRef, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { useMediaStream } from './hooks/useMediaStream';
import { useScreenShare } from './hooks/useScreenShare';
import { usePeerConnections } from './hooks/usePeerConnection';
import { ParticipantVideo } from './components/ParticipantVideo';
import ChatBox from './components/ChatBox';

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous';
  
  const myVideo = useRef();
  const peersRef = useRef({});
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Custom hooks
  const { socket, me } = useSocket();
  const { stream, localStreamRef, toggleAudio, toggleVideo } = useMediaStream();
  
  const { 
    isSharing,
    isSharingRef,
    screenStreamRef,
    currentScreenStream, 
    shareScreen, 
    stopScreenShare 
  } = useScreenShare(
    peersRef,
    localStreamRef,
    roomId,
    socket
  );
  
  const { groupPeers, peersSharingScreen } = usePeerConnections(
    socket,
    stream,
    roomId,
    myName,
    isSharingRef,
    screenStreamRef,
    peersRef,
    me
  );

  // Update my video source
  useEffect(() => {
    if (myVideo.current) {
      const videoSource = isSharing && currentScreenStream ? currentScreenStream : stream;
      if (videoSource) {
        myVideo.current.srcObject = videoSource;
      }
    }
  }, [stream, isSharing, currentScreenStream]);

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  const handleLeave = () => {
    if (confirm('Leave the meeting?')) {
      window.location.href = '/';
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Bar - Google Meet Style */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-300 font-medium">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-300 font-medium">{roomId}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-gray-800 rounded-full transition"
            title="Meeting info"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid Area */}
        <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-300 ${showChat ? 'mr-0' : ''}`}>
          <div className={`w-full h-full flex items-center justify-center`}>
            {/* Grid Container */}
            <div className="grid gap-2 w-full h-full" style={{
              gridTemplateColumns: groupPeers.length === 0 ? '1fr' : 
                                   groupPeers.length === 1 ? 'repeat(2, 1fr)' :
                                   groupPeers.length <= 4 ? 'repeat(2, 1fr)' :
                                   groupPeers.length <= 9 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gridAutoRows: groupPeers.length === 0 ? '1fr' : 
                           groupPeers.length === 1 ? '1fr' :
                           groupPeers.length <= 4 ? 'minmax(0, 1fr)' : 'minmax(200px, 1fr)'
            }}>
              {/* My Video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden group min-h-0">
                <video
                  ref={myVideo}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-gray-900/80 backdrop-blur-sm rounded">
                  <span className="text-xs text-white font-medium">You ({myName})</span>
                </div>
                {isSharing && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-xs font-bold">
                    Presenting
                  </div>
                )}
              </div>

              {/* Other Participants */}
              {groupPeers.map(({ id, peer }) => (
                <ParticipantVideo
                  key={id}
                  peer={peer}
                  userId={id}
                  isSharing={peersSharingScreen.has(id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {groupPeers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-gray-400 text-sm">Waiting for others to join</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col animate-slide-in">
            <ChatBox socket={socket} roomId={roomId} myName={myName} onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Google Meet Style */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left: Meeting Info */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-400">{groupPeers.length + 1} in call</span>
          </div>

          {/* Center: Main Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
              title="Toggle microphone"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              onClick={toggleVideo}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
              title="Toggle camera"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {isSharing ? (
              <button
                onClick={stopScreenShare}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-full transition font-medium text-sm text-white"
              >
                Stop presenting
              </button>
            ) : (
              <button
                onClick={shareScreen}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
                title="Present screen"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            )}

            <button
              onClick={handleLeave}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition ml-2"
              title="Leave call"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
          </div>

          {/* Right: Secondary Controls */}
          <div className="flex items-center gap-2 min-w-[200px] justify-end">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-full transition ${showChat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              title="Toggle chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <button
              onClick={() => copyToClipboard(roomId)}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition"
              title="Copy meeting code"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MeetingRoom;