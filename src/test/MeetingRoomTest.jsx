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
import { updateMeeting } from '../services/meetingApi';

function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const myName = location.state?.myName || 'Anonymous';
  const title = location.state?.title || '';
  const description = location.state?.description || '';
  const meetingId = location.state?.meetingId || null;
  const isHost = location.state?.isHost || false;
  const navigate = useNavigate();

  const myVideo = useRef();
  const peersRef = useRef({});
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Custom hooks
  const { socket, me } = useSocket();
  const { stream, localStreamRef, toggleAudio, toggleVideo } = useMediaStream();

  // Callback function to handle recording completion
  const handleRecordingComplete = async (videoUrl) => {
    console.log('🎬 Recording complete. Video URL:', videoUrl);
    try {
      const response = await updateMeeting({
        meetingId: meetingId,
        Title: title,
        Description: description,
        RecordUrl: videoUrl,
      });

      console.log('✅ Meeting updated successfully:', response.data);
      alert('Video đã được lưu và cập nhật vào meeting!');
    } catch (error) {
      console.error('❌ Failed to update meeting:', error);
      alert('Video đã được upload nhưng không thể cập nhật meeting. Vui lòng kiểm tra lại.');
    }
  };

  const {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    startRecording,
    stopRecording,
    isUploading,
    uploadProgress,
  } = useMeetingRecorder(socket, roomId, stream, handleRecordingComplete);

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
    if (myVideo.current && stream) {
      // Khi KHÔNG share màn hình -> hiển thị camera
      if (!isSharing) {
        myVideo.current.srcObject = stream;
      }
      // Khi share màn hình -> hiển thị màn hình
      else if (currentScreenStream) {
        myVideo.current.srcObject = currentScreenStream;
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

  // Tìm người đang share màn hình
  const sharingPeer = groupPeers.find(({ id }) => peersSharingScreen.has(id));
  const hasScreenShare = isSharing || sharingPeer;

  return (
    <div className='h-screen bg-black flex flex-col overflow-hidden'>
      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center'>
          <div className='bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700'>
            <div className='text-center'>
              <div className='mb-4'>
                <svg className='w-16 h-16 mx-auto text-blue-500 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>Đang upload video...</h3>
              <p className='text-gray-400 mb-4'>Vui lòng không đóng trang này</p>
              
              <div className='w-full bg-gray-700 rounded-full h-3 mb-2'>
                <div 
                  className='bg-blue-500 h-3 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-sm text-gray-300'>{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className='flex items-center justify-between px-4 py-2 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-white text-gray-800 rounded-lg border border-gray-200'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-xs text-gray-600 font-medium'>
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
            className='p-2 hover:bg-gray-100 rounded-full transition'
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
        {/* Video Area */}
        <div className={`flex-1 flex overflow-hidden transition-all duration-300 ${showChat ? 'mr-0' : ''}`}>
          
          {/* Layout khi CÓ người share màn hình */}
          {hasScreenShare ? (
            <div className='flex w-full h-full gap-2 p-2'>
              {/* Main Screen Share Area (bên trái) */}
              <div className='flex-1 flex items-center justify-center bg-gray-950 rounded-lg'>
                {isSharing ? (
                  // Tôi đang share
                  <div className='relative w-full h-full flex items-center justify-center'>
                    <video
                      ref={myVideo}
                      playsInline
                      autoPlay
                      muted
                      className='max-w-full max-h-full object-contain'
                    />
                    <div className='absolute top-4 left-4 px-3 py-1.5 bg-red-500 rounded-lg flex items-center gap-2'>
                      <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                      <span className='text-sm text-white font-semibold'>You are presenting</span>
                    </div>
                  </div>
                ) : sharingPeer ? (
                  // Người khác đang share
                  <div className='relative w-full h-full'>
                    <ParticipantVideo
                      key={sharingPeer.id}
                      peer={sharingPeer.peer}
                      userId={sharingPeer.id}
                      userName={sharingPeer.name}
                      isSharing={true}
                      isMainView={true}
                    />
                  </div>
                ) : null}
              </div>

              {/* Sidebar với thumbnails (bên phải) */}
              <div className='w-80 flex flex-col gap-2 overflow-y-auto py-1 pr-1 custom-scrollbar'>
                {/* Video của tôi - LUÔN HIỂN THỊ (camera) khi người khác share */}
                {!isSharing && (
                  <div className='relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex-shrink-0 group hover:ring-2 hover:ring-blue-500 transition-all'>
                    <video
                      playsInline
                      autoPlay
                      muted
                      ref={(el) => {
                        if (el && stream) {
                          el.srcObject = stream; // Luôn hiển thị camera khi không share
                        }
                      }}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none'></div>
                    <div className='absolute bottom-2 left-2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm rounded text-xs text-white font-medium'>
                      You ({myName})
                    </div>
                  </div>
                )}

                {/* Videos của người khác (không share) */}
                {groupPeers
                  .filter(({ id }) => !peersSharingScreen.has(id))
                  .map(({ id, peer, name }) => (
                    <div key={id} className='flex-shrink-0'>
                      <ParticipantVideo
                        peer={peer}
                        userId={id}
                        userName={name}
                        isSharing={false}
                        isThumbnail={true}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            // Layout BÌNH THƯỜNG (không ai share)
            <div className='flex-1 flex items-center justify-center p-4'>
              <div className='w-full h-full flex items-center justify-center'>
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
                      playsInline
                      autoPlay
                      muted
                      ref={(el) => {
                        if (el && stream) {
                          el.srcObject = stream; // Luôn hiển thị camera trong grid view
                        }
                      }}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none'></div>
                    <div className='absolute bottom-2 left-2 px-2 py-1 bg-gray-900/80 backdrop-blur-sm rounded'>
                      <span className='text-xs text-white font-medium'>
                        You ({myName})
                      </span>
                    </div>
                  </div>

                  {/* Other Participants */}
                  {groupPeers.map(({ id, peer, name }) => (
                    <ParticipantVideo
                      key={id}
                      peer={peer}
                      userId={id}
                      userName={name}
                      isSharing={false}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {groupPeers.length === 0 && (
                  <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                    <div className='text-center'>
                      <div className='w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3'>
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
          )}
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

      {/* Bottom Control Bar */}
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
          isHost={isHost}
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

export default MeetingRoom;