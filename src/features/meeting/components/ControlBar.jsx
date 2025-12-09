import React, { useState } from 'react';

export const ControlBar = ({
  isSharing,
  onShareScreen,
  onStopSharing,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  initialAudio = true,
  initialVideo = true,
  onToggleChat,
  showChat,
  participantCount,
  currentTime,
  isRecording,
  isRecordingDisabled,
  onStartScreenRecording,
  onStopRecording,
  isHost,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(initialAudio);
  const [videoEnabled, setVideoEnabled] = useState(initialVideo);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleToggleAudio = async () => {
    setIsTogglingAudio(true);
    try {
      const enabled = await onToggleAudio();
      setAudioEnabled(enabled);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    } finally {
      setIsTogglingAudio(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartScreenRecording();
    }
  };

  const handleToggleVideo = async () => {
    setIsTogglingVideo(true);
    try {
      const enabled = await onToggleVideo();
      setVideoEnabled(enabled);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    } finally {
      setIsTogglingVideo(false);
    }
  };

  const handleLeave = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    onLeave();
  };

  const cancelLeave = () => {
    setShowLeaveConfirm(false);
  };

  // ✅ NEW: Handler for chat toggle with extensive logging
  const handleChatToggle = () => {
    if (typeof onToggleChat === 'function') {
      onToggleChat();
    } else {
      console.error('   ❌ onToggleChat is not a function!');
    }
  };

  return (
    <>
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center'>
          <div className='bg-[#3c4043] rounded-2xl p-6 max-w-sm w-full mx-4 border border-[#5f6368] shadow-2xl'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-6 h-6 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-white mb-2'>Leave Meeting?</h3>
              <p className='text-[#9aa0a6] text-sm mb-6'>
                Are you sure you want to leave this meeting?
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={cancelLeave}
                  className='flex-1 px-4 py-2.5 bg-[#5f6368] hover:bg-[#6b7075] text-white font-medium rounded-xl transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeave}
                  className='flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors'
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='w-full flex justify-center'>
        <div className='bg-[#3c4043] backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-[#5f6368] flex items-center gap-2'>
          
          {/* Left Section - Meeting Info */}
          <div className='flex items-center gap-3 px-3 border-r border-[#5f6368] mr-2'>
            <div className='text-[#e8eaed] text-sm'>
              <span className='font-medium'>{currentTime}</span>
            </div>
            <div className='w-1 h-1 bg-[#5f6368] rounded-full'></div>
            <div className='text-[#9aa0a6] text-sm flex items-center gap-1.5'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
              </svg>
              <span>{participantCount}</span>
            </div>
          </div>

          {/* Center Section - Main Controls */}
        <div className='flex items-center gap-2'>
          {/* Microphone */}
          <button
            className={`relative group p-3.5 rounded-full transition-all ${
              audioEnabled
                ? 'bg-transparent hover:bg-[#5f6368]'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={handleToggleAudio}
            disabled={isTogglingAudio}
            title={audioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {audioEnabled ? (
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z' clipRule='evenodd' />
              </svg>
            ) : (
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z' clipRule='evenodd' />
              </svg>
            )}
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              {audioEnabled ? 'Turn off mic (Ctrl+D)' : 'Turn on mic (Ctrl+D)'}
            </div>
          </button>

          {/* Camera */}
          <button
            className={`relative group p-3.5 rounded-full transition-all ${
              videoEnabled
                ? 'bg-transparent hover:bg-[#5f6368]'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={handleToggleVideo}
            disabled={isTogglingVideo}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? (
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
              </svg>
            ) : (
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z' clipRule='evenodd' />
              </svg>
            )}
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              {videoEnabled ? 'Turn off camera (Ctrl+E)' : 'Turn on camera (Ctrl+E)'}
            </div>
          </button>

          {/* Screen Share */}
          {!isSharing ? (
            <button
              className='relative group p-3.5 rounded-full bg-transparent hover:bg-[#5f6368] transition-all'
              onClick={onShareScreen}
              title='Present now'
            >
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z' clipRule='evenodd' />
              </svg>
              {/* Tooltip */}
              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
                Share screen
              </div>
            </button>
          ) : (
            <button
              className='relative group p-3.5 rounded-full bg-[#8ab4f8] hover:bg-[#aecbfa] transition-all'
              onClick={onStopSharing}
              title='Stop presenting'
            >
              <svg className='w-6 h-6 text-[#202124]' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z' clipRule='evenodd' />
              </svg>
              {/* Tooltip */}
              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
                Stop sharing
              </div>
            </button>
          )}

          {/* Recording (Host Only) */}
          {isHost && (
            <button
              onClick={handleToggleRecording}
              disabled={isRecordingDisabled}
              className={`relative group p-3.5 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : isRecordingDisabled
                    ? 'bg-[#5f6368] cursor-not-allowed opacity-50'
                    : 'bg-transparent hover:bg-[#5f6368]'
              }`}
              title={
                isRecordingDisabled
                  ? 'Someone else is recording'
                  : isRecording
                    ? 'Stop recording'
                    : 'Start recording'
              }
            >
              <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <circle cx='10' cy='10' r='5' />
              </svg>
              {isRecording && (
                <span className='absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-red-600'></span>
              )}
              {/* Tooltip */}
              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
                {isRecording ? 'Stop recording' : 'Record screen'}
              </div>
            </button>
          )}

          {/* ✅ NEW: Direct Chat Button (Alternative to More menu) */}
          <button
            className={`relative group p-3.5 rounded-full transition-all ${
              showChat
                ? 'bg-[#8ab4f8] hover:bg-[#aecbfa]'
                : 'bg-transparent hover:bg-[#5f6368]'
            }`}
            onClick={handleChatToggle}
            title={showChat ? 'Hide chat' : 'Show chat'}
          >
            <svg 
              className={`w-6 h-6 ${showChat ? 'text-[#202124]' : 'text-white'}`} 
              fill='currentColor' 
              viewBox='0 0 20 20'
            >
              <path fillRule='evenodd' d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z' clipRule='evenodd' />
            </svg>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              {showChat ? 'Hide chat' : 'Show chat'}
            </div>
          </button>

        </div>

        {/* Right Section - Leave Button */}
        <div className='flex items-center pl-2 ml-2 border-l border-[#5f6368]'>
          <button
            className='relative group px-6 py-2.5 rounded-full bg-[#ea4335] hover:bg-[#d33b2c] text-white font-medium transition-all shadow-lg hover:shadow-xl'
            onClick={handleLeave}
            title='Leave call'
          >
            <span className='flex items-center gap-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                <path d='M16.707 3.293a1 1 0 010 1.414L15.414 6l1.293 1.293a1 1 0 01-1.414 1.414L14 7.414l-1.293 1.293a1 1 0 11-1.414-1.414L12.586 6l-1.293-1.293a1 1 0 011.414-1.414L14 4.586l1.293-1.293a1 1 0 011.414 0z' />
              </svg>
              Leave
            </span>
            {/* Tooltip */}
            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
              Leave room
            </div>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
