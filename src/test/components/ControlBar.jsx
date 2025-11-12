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
  roomId,
  onCopyRoomId,
  currentTime,
  myName,
  isRecording,
  isRecordingDisabled,
  recordingUserId,
  onStartScreenRecording,
  onStopRecording,
  me,
  isHost,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(initialAudio);
  const [videoEnabled, setVideoEnabled] = useState(initialVideo);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);

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
    if (confirm('Are you sure you want to leave this meeting?')) {
      onLeave();
    }
  };

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl flex justify-center'>
      <div className='w-full flex items-center justify-between bg-gray-900/80 backdrop-blur-md rounded-2xl px-6 py-3 border border-gray-800 shadow-2xl'>
        {/* Left Info Section */}
        <div className='flex flex-col text-xs text-gray-300 leading-tight'>
          <span>
            <strong>📁 Room:</strong>{' '}
            <span className='font-mono'>{roomId}</span>
            <button
              className='ml-2 px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 transition text-xs'
              onClick={onCopyRoomId}
              title='Copy Room ID'
            >
              📋
            </button>
          </span>
          <span>⏰ {currentTime}</span>
          <span>👤 {myName}</span>
          <span>👥 {participantCount} participants</span>
        </div>

        {/* Center Control Buttons */}
        <div className='flex items-center gap-3'>
          {/* Chat */}
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              showChat
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={onToggleChat}
            title='Toggle Chat'
          >
            💬
          </button>

          {/* Mic */}
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              audioEnabled
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={handleToggleAudio}
            disabled={isTogglingAudio}
            title={audioEnabled ? 'Tắt mic' : 'Bật mic'}
          >
            {audioEnabled ? '🎤' : '🔇'}
          </button>

          {/* Camera */}
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              videoEnabled
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={handleToggleVideo}
            disabled={isTogglingVideo}
            title={videoEnabled ? 'Tắt camera' : 'Bật camera'}
          >
            {videoEnabled ? '📹' : '🚫'}
          </button>
          {/* Recording */}
          {isHost && (
            <button
              onClick={handleToggleRecording}
              disabled={isRecordingDisabled}
              className={`p-3 rounded-full transition-colors relative ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : isRecordingDisabled
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={
                isRecordingDisabled
                  ? 'Có người khác đang ghi'
                  : isRecording
                    ? 'Dừng ghi'
                    : 'Bắt đầu ghi'
              }
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <circle cx='10' cy='10' r='6' />
              </svg>
              {isRecording && (
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
              )}
            </button>
          )}

          {/* Share Screen */}
          {!isSharing ? (
            <button
              className='w-10 h-10 rounded-full flex items-center justify-center bg-yellow-600 text-white hover:bg-yellow-500 shadow-md transition'
              onClick={onShareScreen}
              title='Chia sẻ màn hình'
            >
              🖥️
            </button>
          ) : (
            <button
              className='w-10 h-10 rounded-full flex items-center justify-center bg-red-600 text-white hover:bg-red-500 shadow-md transition'
              onClick={onStopSharing}
              title='Ngừng chia sẻ'
            >
              ⛔
            </button>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          {/* Recording Indicator */}
          {recordingUserId && (
            <div className='flex items-center space-x-2 text-sm'>
              <div className='w-2 h-2 bg-red-600 rounded-full animate-pulse'></div>
              <span className='text-gray-300'>
                {recordingUserId === me ? 'Bạn đang ghi' : 'Đang ghi'}
              </span>
            </div>
          )}
        </div>

        {/* Right Leave */}
        <div>
          <button
            className='px-5 py-2 rounded-full bg-red-700 hover:bg-red-600 text-white font-semibold shadow-lg transition'
            onClick={handleLeave}
            title='Rời phòng'
          >
            🚪 Leave
          </button>
        </div>
      </div>
    </div>
  );
};
