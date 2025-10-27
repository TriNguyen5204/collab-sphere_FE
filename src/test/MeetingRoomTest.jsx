import React, { useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { useMediaStream } from './hooks/useMediaStream';
import { useScreenShare } from './hooks/useScreenShare';
import { usePeerConnections } from './hooks/usePeerConnection';
import { ParticipantVideo } from './components/ParticipantVideo';
import { ControlBar } from './components/ControlBar';

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous';
  
  const myVideo = useRef();
  const peersRef = useRef({}); // ✅ Create ref in component
  
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
    peersRef,        // ✅ Pass the SAME ref
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
    peersRef        // ✅ Pass the SAME ref here too!
  );

  // Update my video source
  React.useEffect(() => {
    if (myVideo.current) {
      // Use screen stream if sharing, otherwise use camera
      const videoSource = isSharing && currentScreenStream ? currentScreenStream : stream;
      if (videoSource) {
        myVideo.current.srcObject = videoSource;
        console.log('📹 My video updated:', isSharing ? 'SCREEN SHARE' : 'CAMERA');
      }
    }
  }, [stream, isSharing, currentScreenStream]);

  // Debug: Log refs state
  React.useEffect(() => {
    console.log('🔍 Refs state:', {
      isSharing,
      isSharingRefCurrent: isSharingRef.current,
      hasScreenStream: !!screenStreamRef.current,
      peersCount: Object.keys(peersRef.current).length
    });
  }, [isSharing, peersRef.current]);

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  const handleLeave = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Meeting Room
            </h1>
            <p className="text-sm text-gray-400 mt-1">Room ID: {roomId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">
                {groupPeers.length + 1} participant{groupPeers.length !== 0 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(roomId)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>📋</span>
              <span>Copy Room ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* My Video */}
          <div className="relative group">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-blue-500/50">
              <video
                ref={myVideo}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-white drop-shadow-lg">
                  You ({myName})
                </span>
              </div>
              {isSharing && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                  🖥️ Sharing
                </div>
              )}
            </div>
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
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Waiting for others to join...
            </h3>
            <p className="text-gray-500">Share the Room ID to invite participants</p>
          </div>
        )}

        {/* Control Bar */}
        <ControlBar
          isSharing={isSharing}
          onShareScreen={shareScreen}
          onStopSharing={stopScreenShare}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onLeave={handleLeave}
        />

        {/* Info Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Your ID: {me.slice(0, 8)}... | Connections: {Object.keys(peersRef.current).length}
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;