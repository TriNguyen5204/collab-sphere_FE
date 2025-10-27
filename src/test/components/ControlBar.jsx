import React, { useState } from 'react';

export const ControlBar = ({
  isSharing,
  onShareScreen,
  onStopSharing,
  onToggleAudio,
  onToggleVideo,
  onLeave,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleToggleAudio = () => {
    const enabled = onToggleAudio();
    setAudioEnabled(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = onToggleVideo();
    setVideoEnabled(enabled);
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this meeting?')) {
      onLeave();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Microphone */}
          <button
            onClick={handleToggleAudio}
            className={`w-12 h-12 rounded-xl ${
              audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } transition-all hover:scale-110 active:scale-95 flex items-center justify-center`}
            title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            <span className="text-xl">{audioEnabled ? '🎤' : '🔇'}</span>
          </button>

          {/* Camera */}
          <button
            onClick={handleToggleVideo}
            className={`w-12 h-12 rounded-xl ${
              videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } transition-all hover:scale-110 active:scale-95 flex items-center justify-center`}
            title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <span className="text-xl">{videoEnabled ? '📹' : '📵'}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-600"></div>

          {/* Screen Share */}
          {isSharing ? (
            <button
              onClick={onStopSharing}
              className="px-6 h-12 rounded-xl bg-red-600 hover:bg-red-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-2 font-semibold"
            >
              <span>🛑</span>
              <span>Stop Sharing</span>
            </button>
          ) : (
            <button
              onClick={onShareScreen}
              className="px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center gap-2 font-semibold"
            >
              <span>🖥️</span>
              <span>Share Screen</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-600"></div>

          {/* Leave Button */}
          <button
            onClick={handleLeave}
            className="w-12 h-12 rounded-xl bg-red-600 hover:bg-red-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            title="Leave Meeting"
          >
            <span className="text-xl">📞</span>
          </button>
        </div>
      </div>
    </div>
  );
};