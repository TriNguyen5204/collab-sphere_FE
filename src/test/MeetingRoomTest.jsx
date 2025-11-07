import { useRef, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { useMediaStream } from './hooks/useMediaStream';
import { useScreenShare } from './hooks/useScreenShare';
import { usePeerConnections } from './hooks/usePeerConnection';
import { ParticipantVideo } from './components/ParticipantVideo';
import { ControlBar } from './components/ControlBar';
import { useMeetingRecorder } from './hooks/useMeetingRecorder';
import ChatBox from './components/ChatBox';
import { useNavigate } from 'react-router-dom';

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous';
  const videoEnabled = location.state?.videoEnabled ?? true;
  const audioEnabled = location.state?.audioEnabled ?? true;
  const navigate = useNavigate();

  const myVideo = useRef();
  const peersRef = useRef({});
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Custom hooks
  const { socket, me } = useSocket();
  const { stream, localStreamRef, toggleAudio, toggleVideo } = useMediaStream(
    videoEnabled,
    audioEnabled
  );
  const {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    startRecording,
    stopRecording,
  } = useMeetingRecorder(socket, roomId);

  const {
    isSharing,
    isSharingRef,
    screenStreamRef,
    currentScreenStream,
    shareScreen,
    stopScreenShare,
  } = useScreenShare(peersRef, localStreamRef, roomId, socket);

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
      const videoSource =
        isSharing && currentScreenStream ? currentScreenStream : stream;
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
    navigate('/room');
  };

  return (
    <div className='h-screen bg-black flex flex-col overflow-hidden'>
      {/* Top Bar - Google Meet Style */}
      <div className='flex items-center justify-between px-4 py-2 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-xs text-gray-300 font-medium'>
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <span className='text-sm text-gray-400'>|</span>
          <span className='text-sm text-gray-300 font-medium'>{roomId}</span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className='p-2 hover:bg-gray-800 rounded-full transition'
            title='Meeting info'
          >
            <svg
              className='w-5 h-5 text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Video Grid Area */}
        <div
          className={`flex-1 flex items-center justify-center p-4 transition-all duration-300 ${showChat ? 'mr-0' : ''}`}
        >
          <div className={`w-full h-full flex items-center justify-center`}>
            {/* Grid Container */}
            <div
              className='grid gap-2 w-full h-full'
              style={{
                gridTemplateColumns:
                  groupPeers.length === 0
                    ? '1fr'
                    : groupPeers.length === 1
                      ? 'repeat(2, 1fr)'
                      : groupPeers.length <= 4
                        ? 'repeat(2, 1fr)'
                        : groupPeers.length <= 9
                          ? 'repeat(3, 1fr)'
                          : 'repeat(4, 1fr)',
                gridAutoRows:
                  groupPeers.length === 0
                    ? '1fr'
                    : groupPeers.length === 1
                      ? '1fr'
                      : groupPeers.length <= 4
                        ? 'minmax(0, 1fr)'
                        : 'minmax(200px, 1fr)',
              }}
            >
              {/* My Video */}
              <div className='relative bg-gray-900 rounded-lg overflow-hidden group min-h-0'>
                <video
                  ref={myVideo}
                  playsInline
                  autoPlay
                  muted
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none'></div>
                <div className='absolute bottom-2 left-2 px-2 py-1 bg-gray-900/80 backdrop-blur-sm rounded'>
                  <span className='text-xs text-white font-medium'>
                    You ({myName})
                  </span>
                </div>
                {isSharing && (
                  <div className='absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-xs font-bold'>
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
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-3xl'>👥</span>
                  </div>
                  <p className='text-gray-400 text-sm'>
                    Waiting for others to join
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className='w-80 bg-white border-l border-gray-200 flex flex-col animate-slide-in'>
            <ChatBox
              socket={socket}
              roomId={roomId}
              myName={myName}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Google Meet Style */}
      <div className='bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-4 py-3'>
        <ControlBar
          isSharing={isSharing}
          onShareScreen={shareScreen}
          onStopSharing={stopScreenShare}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onLeave={handleLeave}
          initialAudio={true}
          initialVideo={true}
          onToggleChat={() => setShowChat(!showChat)}
          showChat={showChat}
          participantCount={groupPeers.length + 1}
          roomId={roomId}
          onCopyRoomId={() => copyToClipboard(roomId)}
          currentTime={new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          myName={myName}
          isRecording={isRecording}
          isRecordingDisabled={isRecordingDisabled}
          recordingUserId={recordingUserId}
          onStartScreenRecording={startRecording}
          onStopRecording={stopRecording}
          me={me}
          // Có thể truyền thêm các props khác bạn muốn hiện trong bar
        />
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
