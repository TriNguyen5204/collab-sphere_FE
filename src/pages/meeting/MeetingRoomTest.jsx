import { useRef, useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../features/meeting/hooks/useSocket';
import { useMediaStream } from '../../features/meeting/hooks/useMediaStream';
import { useScreenShare } from '../../features/meeting/hooks/useScreenShare';
import { usePeerConnections } from '../../features/meeting/hooks/usePeerConnection';
import { ParticipantVideo } from '../../features/meeting/components/ParticipantVideo';
import { ControlBar } from '../../features/meeting/components/ControlBar';
import { useMeetingRecorder } from '../../features/meeting/hooks/useMeetingRecorder';
import ChatBox from '../../features/meeting/components/ChatBox';
import { updateMeeting } from '../../features/meeting/services/meetingApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * MeetingRoom - Simplified version
 * Security: User must be logged in to join
 * Logic: login = access (no waiting room)
 */
function MeetingRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get teamId from navigation state (hidden from URL for security)
  const [teamId] = useState(location.state?.teamId || null);
  
  // Get authenticated user data from Redux store (secure source)
  const userId = useSelector(state => state.user.userId);
  const fullName = useSelector(state => state.user.fullName);
  const roleName = useSelector(state => state.user.roleName);
  const accessToken = useSelector(state => state.user.accessToken);
  
  // Use authenticated user name
  const myName = fullName || 'User';
  
  // Get meeting info from navigation state (optional metadata)
  const title = location.state?.title || '';
  const meetingId = location.state?.meetingId || null;
  const isHost = location.state?.isHost || false;

  // Simple authorization state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [roomExists, setRoomExists] = useState(null); // null = checking, true/false = result
  const [roomClosedByHost, setRoomClosedByHost] = useState(false);

  const myVideo = useRef();
  const peersRef = useRef({});
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Initialize socket
  const { socket, me, isConnected } = useSocket();
  
  // Simple authorization check: login = access
  useEffect(() => {
    const validateAccess = () => {
      setIsCheckingAuth(true);
      setAuthError(null);

      // User must be authenticated (have valid token and userId)
      if (!accessToken || !userId) {
        setAuthError('You must be logged in to join a meeting.');
        setIsCheckingAuth(false);
        return;
      }

      // User is logged in → allow access
      console.log('✅ [MeetingRoom] User authenticated - granting access');
      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    validateAccess();
  }, [accessToken, userId]);

  // Check if room exists when socket is ready and connected
  useEffect(() => {
    // Wait for socket to be connected before proceeding
    if (!socket || !isConnected || !roomId || !isAuthorized) return;

    // If user is the host, they're creating the room - no need to check
    if (isHost) {
      console.log('🏠 [MeetingRoom] User is host - skipping room check');
      setRoomExists(true);
      return;
    }

    // For non-host users: Socket is connected, allow joining
    // Note: Room existence check is disabled because deployed server may not support it
    // The room-closed event from server will handle the case when host leaves
    console.log('✅ [MeetingRoom] Socket connected - allowing room access');
    setRoomExists(true);
    
    // Optional: Try to check room existence (won't block if server doesn't support it)
    socket.emit('check-room-exists', { roomId }, (response) => {
      console.log('🔍 [MeetingRoom] Room check response (informational):', response);
      // Only deny access if server explicitly says room doesn't exist
      if (response && response.exists === false) {
        console.log('❌ [MeetingRoom] Server confirmed room does not exist');
        setRoomExists(false);
        setAuthError('This meeting room does not exist or has ended.');
      } else if (response && response.exists && !response.hasHost) {
        console.log('⚠️ [MeetingRoom] Room has no host');
        setRoomExists(false);
        setAuthError('This meeting room has no host. The meeting may have ended.');
      }
    });
  }, [socket, isConnected, roomId, isAuthorized, isHost]);

  // Handle room closed by host callback
  const handleRoomClosed = useCallback((reason) => {
    console.log('🚪 [MeetingRoom] Room closed:', reason);
    setRoomClosedByHost(true);
    toast.error(reason || 'The meeting has ended');
  }, []);

  // Media stream hook
  const { stream, localStreamRef, toggleAudio, toggleVideo } = useMediaStream();

  // Callback for recording completion
  const handleRecordingComplete = async (videoUrl) => {
    console.log('🎬 Recording complete. Video URL:', videoUrl);
    try {
      await updateMeeting({
        meetingId: meetingId,
        Title: title,
        RecordUrl: videoUrl,
      });
      toast.success('Video has been saved and updated to the meeting!');
    } catch (error) {
      toast.error('Video has been uploaded but could not update the meeting. Please check again.');
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

  const { groupPeers, peersSharingScreen, roomClosed } = usePeerConnections(
    socket,
    isAuthorized && roomExists === true ? stream : null, // Only pass stream when room check passed (roomExists === true)
    roomId,
    myName,
    isSharingRef,
    screenStreamRef,
    peersRef,
    me,
    isHost,
    handleRoomClosed // Pass callback for when room is closed by host
  );

  // Update my video source
  useEffect(() => {
    if (myVideo.current && stream) {
      if (!isSharing) {
        myVideo.current.srcObject = stream;
      }
      // When sharing screen -> show screen
      else if (currentScreenStream) {
        myVideo.current.srcObject = currentScreenStream;
      }
    }
  }, [stream, isSharing, currentScreenStream]);

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    toast.success('Copied: ' + text);
  };

  const handleLeave = () => {
    if(roleName === 'STUDENT') {
      navigate(`/meeting/${teamId}`, { replace: true });
    } else if(roleName === 'LECTURER') {
      navigate(`/lecturer/meetings`, { replace: true });
    }
  };

  // Find person sharing screen
  const sharingPeer = groupPeers.find(({ id }) => peersSharingScreen.has(id));
  const hasScreenShare = isSharing || sharingPeer;

  // Handle back navigation for unauthorized users
  const handleGoBack = () => {
    if (roleName === 'STUDENT' && teamId) {
      navigate(`/meeting/${teamId}`, { replace: true });
    } else if (roleName === 'LECTURER') {
      navigate(`/lecturer/meetings`, { replace: true });
    } else if (roleName === 'STUDENT') {
      navigate('/student/projects', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className='h-screen bg-[#202124] flex flex-col items-center justify-center'>
        <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
        <p className='text-white text-lg font-medium'>Verifying access...</p>
        <p className='text-[#9aa0a6] text-sm mt-2'>Please wait while we check your permissions</p>
      </div>
    );
  }

  // Waiting for socket connection
  if (isAuthorized && !isConnected && !isHost) {
    return (
      <div className='h-screen bg-[#202124] flex flex-col items-center justify-center'>
        <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
        <p className='text-white text-lg font-medium'>Connecting to server...</p>
        <p className='text-[#9aa0a6] text-sm mt-2'>Establishing secure connection</p>
      </div>
    );
  }

  // Checking if room exists (for non-host users)
  if (isAuthorized && isConnected && roomExists === null && !isHost) {
    return (
      <div className='h-screen bg-[#202124] flex flex-col items-center justify-center'>
        <Loader2 className='w-12 h-12 text-blue-500 animate-spin mb-4' />
        <p className='text-white text-lg font-medium'>Connecting to meeting...</p>
        <p className='text-[#9aa0a6] text-sm mt-2'>Verifying room availability</p>
      </div>
    );
  }

  // Room was closed by host
  if (roomClosedByHost || roomClosed) {
    return (
      <div className='h-screen bg-[#202124] flex items-center justify-center'>
        <div className='text-center max-w-md px-6'>
          <div className='w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <ShieldAlert className='w-8 h-8 text-orange-500' />
          </div>
          <h2 className='text-xl font-bold text-white mb-3'>Meeting Ended</h2>
          <p className='text-[#9aa0a6] mb-6'>
            The host has left the meeting. This session has been closed.
          </p>
          <button
            onClick={handleGoBack}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Room doesn't exist
  if (roomExists === false) {
    return (
      <div className='h-screen bg-[#202124] flex items-center justify-center'>
        <div className='text-center max-w-md px-6'>
          <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <ShieldAlert className='w-8 h-8 text-red-500' />
          </div>
          <h2 className='text-xl font-bold text-white mb-3'>Room Not Found</h2>
          <p className='text-[#9aa0a6] mb-6'>
            This meeting room does not exist or has already ended.
          </p>
          <button
            onClick={handleGoBack}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Access denied (not logged in)
  if (authError || !isAuthorized) {
    return (
      <div className='h-screen bg-[#202124] flex items-center justify-center'>
        <div className='text-center max-w-md px-6'>
          <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
            <ShieldAlert className='w-8 h-8 text-red-500' />
          </div>
          <h2 className='text-xl font-bold text-white mb-3'>Access Denied</h2>
          <p className='text-[#9aa0a6] mb-6'>
            {authError || 'You do not have permission to join this meeting.'}
          </p>
          <button
            onClick={handleGoBack}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen bg-[#202124] flex flex-col overflow-hidden'>
      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center'>
          <div className='bg-[#3c4043] rounded-xl p-8 max-w-md w-full mx-4 border border-[#5f6368]'>
            <div className='text-center'>
              <div className='mb-4'>
                <svg className='w-16 h-16 mx-auto text-blue-500 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>Uploading video...</h3>
              <p className='text-[#9aa0a6] mb-4'>Please do not close this page</p>
              
              <div className='w-full bg-[#5f6368] rounded-full h-2 mb-2'>
                <div 
                  className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-sm text-[#e8eaed]'>{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className='flex items-center justify-between px-6 py-4 bg-transparent backdrop-blur-sm z-10'>
        <div className='flex items-center gap-4'>
          {/* Time Badge */}
          <div className='flex items-center gap-2 px-3 py-2 bg-[#3c4043] rounded-full'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-xs text-[#e8eaed] font-medium'>
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          
          {/* Meeting Code */}
          <div className='flex items-center gap-2 px-3 py-2 bg-[#3c4043] rounded-full cursor-pointer hover:bg-[#5f6368] transition-colors'>
            <span className='text-sm text-[#e8eaed] font-mono'>{roomId}</span>
            <button
              onClick={() => copyToClipboard(roomId)}
              className='text-[#8ab4f8] hover:text-[#aecbfa] transition-colors'
              title='Copy meeting code'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z' />
                <path d='M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z' />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className='flex items-center gap-2'>
          {/* Recording Indicator */}
          {recordingUserId && (
            <div className='flex items-center gap-2 px-3 py-2 bg-red-600/20 rounded-full'>
              <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-red-400 font-medium'>
                {recordingUserId === me ? 'You are recording' : 'Recording'}
              </span>
            </div>
          )}

          {/* Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className='p-2 hover:bg-[#5f6368] rounded-full transition-colors'
            title='Meeting info'
          >
            <svg
              className='w-5 h-5 text-[#e8eaed]'
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

      {/* ✅ FIXED: Main Content Area - Removed relative positioning that was blocking chat */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Video Area - Adjusted width when chat is open */}
        <div className={`flex overflow-hidden transition-all duration-300 ${showChat ? 'flex-1' : 'w-full'}`}>
          
          {/* Layout when SOMEONE is sharing screen */}
          {hasScreenShare ? (
            <div className='flex w-full h-full gap-3 p-4'>
              {/* Main Screen Share Area (left) */}
              <div className='flex-1 flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl'>
                {isSharing ? (
                  // I am sharing
                  <div className='relative w-full h-full flex items-center justify-center'>
                    <video
                      ref={myVideo}
                      playsInline
                      autoPlay
                      muted
                      className='max-w-full max-h-full object-contain'
                    />
                    <div className='absolute top-6 left-6 px-4 py-2 bg-red-500 rounded-full flex items-center gap-2 shadow-lg'>
                      <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                      <span className='text-sm text-white font-semibold'>You are presenting</span>
                    </div>
                  </div>
                ) : sharingPeer ? (
                  // Others are sharing
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

              {/* Sidebar with thumbnails (right) */}
              <div className='w-80 flex flex-col gap-2 overflow-y-auto py-1 pr-1 custom-scrollbar'>
                {/* My video - ALWAYS SHOW (camera) when others share */}
                {!isSharing && (
                  <div className='relative bg-[#3c4043] rounded-xl overflow-hidden aspect-video flex-shrink-0 group hover:ring-2 hover:ring-blue-500 transition-all shadow-lg'>
                    <video
                      playsInline
                      autoPlay
                      muted
                      ref={(el) => {
                        if (el && stream) {
                          el.srcObject = stream; // Always show camera when not sharing
                        }
                      }}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none'></div>
                    <div className='absolute bottom-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg'>
                      <span className='text-sm text-white font-medium'>You ({myName})</span>
                    </div>
                  </div>
                )}

                {/* Others' videos (not sharing) */}
                {groupPeers
                  .filter((p) => !peersSharingScreen.has(p.id))
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
            // NORMAL Layout (no one sharing)
            <div className='flex-1 flex items-center justify-center p-4'>
              <div className='w-full h-full flex items-center justify-center'>
                <div
                  className='grid gap-3 w-full h-full'
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
                  <div className='relative bg-[#3c4043] rounded-2xl overflow-hidden group min-h-0 shadow-xl'>
                    <video
                      playsInline
                      autoPlay
                      muted
                      ref={(el) => {
                        if (el && stream) {
                          el.srcObject = stream; // Always show camera in grid view
                        }
                      }}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none'></div>
                    <div className='absolute bottom-4 left-4 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-xl'>
                      <span className='text-sm text-white font-semibold'>
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
                      <div className='w-20 h-20 bg-[#3c4043] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl'>
                        <svg className='w-10 h-10 text-[#9aa0a6]' fill='currentColor' viewBox='0 0 20 20'>
                          <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                        </svg>
                      </div>
                      <p className='text-[#9aa0a6] text-base font-medium'>
                        Waiting for others to join
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ FIXED: Chat Sidebar with proper z-index and positioning */}
        {showChat && (
          <div className='w-96 bg-white border-l border-[#5f6368] flex flex-col shadow-2xl z-20'>
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
      <div className='pb-6 px-4 relative z-30'>
        <ControlBar
          isSharing={isSharing}
          onShareScreen={shareScreen}
          onStopSharing={stopScreenShare}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onLeave={handleLeave}
          initialAudio={true}
          initialVideo={true}
          onToggleChat={() => {
            console.log('🔄 Toggling chat from:', showChat, 'to:', !showChat);
            setShowChat(!showChat);
          }}
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
