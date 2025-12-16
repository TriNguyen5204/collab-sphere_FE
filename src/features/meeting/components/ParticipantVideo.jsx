import React, { useEffect, useRef, useState } from 'react';

export const ParticipantVideo = ({
  peer,
  userId,
  userName,
  isSharing,
  isMainView = false,
  isThumbnail = false,
}) => {
  const ref = useRef();
  const [hasStream, setHasStream] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const streamHandledRef = useRef(false);
  const trackCheckIntervalRef = useRef(null);

  // CANVAS-BASED BLACK SCREEN DETECTION
  useEffect(() => {
    const videoElement = ref.current;
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const detectVideo = () => {
      // Wait for video to be ready
      if (videoElement.readyState < 2) {
        return;
      }

      // Get video dimensions
      const width = videoElement.videoWidth || 320;
      const height = videoElement.videoHeight || 240;

      // If no dimensions, camera is off
      if (width === 0 || height === 0) {
        setIsVideoEnabled(false);
        return;
      }

      canvas.width = width;
      canvas.height = height;

      try {
        // Draw current video frame to canvas
        ctx.drawImage(videoElement, 0, 0, width, height);

        // Sample pixels from canvas
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Count bright pixels (check 200 random pixels for performance)
        let brightPixels = 0;
        const sampleSize = 200;

        for (let i = 0; i < sampleSize; i++) {
          const randomIdx = Math.floor(Math.random() * (data.length / 4)) * 4;
          const r = data[randomIdx];
          const g = data[randomIdx + 1];
          const b = data[randomIdx + 2];

          // If pixel brightness > 20 (not black)
          if (r > 20 || g > 20 || b > 20) {
            brightPixels++;
          }
        }

        // If more than 15% of sampled pixels are bright → video is on
        const brightnessThreshold = sampleSize * 0.15;
        const hasVideo = brightPixels > brightnessThreshold;

        setIsVideoEnabled(hasVideo);
      } catch (err) {
        console.warn(`📹 [${userName}] Canvas detection failed:`, err);
        // Fallback to dimension check
        setIsVideoEnabled(width > 0 && height > 0);
      }
    };

    // Initial check
    setTimeout(detectVideo, 1000);

    // Listen to video events
    videoElement.addEventListener('loadedmetadata', detectVideo);
    videoElement.addEventListener('playing', detectVideo);

    // Regular polling
    const interval = setInterval(detectVideo, 1000);

    return () => {
      videoElement.removeEventListener('loadedmetadata', detectVideo);
      videoElement.removeEventListener('playing', detectVideo);
      clearInterval(interval);
    };
  }, [userName]);

  useEffect(() => {
    if (streamHandledRef.current) return;
    streamHandledRef.current = true;

    const handleStream = stream => {
      if (ref.current && ref.current.srcObject !== stream) {
        ref.current.srcObject = stream;
        setHasStream(true);
      }
    };

    peer.on('stream', handleStream);

    if (peer.streams?.length > 0) {
      handleStream(peer.streams[0]);
    }

    // Poll for track changes (screen share detection)
    trackCheckIntervalRef.current = setInterval(() => {
      if (!peer._pc) return;

      try {
        const receivers = peer._pc.getReceivers();
        const videoReceiver = receivers?.find(r => r.track?.kind === 'video');

        if (videoReceiver?.track) {
          const currentStream = ref.current?.srcObject;

          if (!currentStream) {
            // No stream yet, create one
            const newStream = new MediaStream([videoReceiver.track]);
            // Add audio if exists
            const audioReceiver = receivers?.find(
              r => r.track?.kind === 'audio'
            );
            if (audioReceiver?.track) {
              newStream.addTrack(audioReceiver.track);
            }
            if (ref.current) {
              ref.current.srcObject = newStream;
              setHasStream(true);
            }
            return;
          }

          const currentVideoTrack = currentStream.getVideoTracks()[0];

          // ✅ CRITICAL: Check if track changed by ID OR readyState
          if (currentVideoTrack) {
            const trackChanged =
              currentVideoTrack.id !== videoReceiver.track.id;
            const trackEnded = currentVideoTrack.readyState === 'ended';

            if (trackChanged || trackEnded) {
              // Create new stream with ALL tracks
              const newStream = new MediaStream();

              // Add video track
              newStream.addTrack(videoReceiver.track);

              // Add audio track if exists
              const audioReceiver = receivers?.find(
                r => r.track?.kind === 'audio'
              );
              if (audioReceiver?.track) {
                newStream.addTrack(audioReceiver.track);
              }

              if (ref.current) {
                // Force video element to reload
                ref.current.srcObject = null;
                setTimeout(() => {
                  if (ref.current) {
                    ref.current.srcObject = newStream;
                    ref.current
                      .play()
                      .catch(e => console.warn('Play error:', e));
                    console.log('✅ Video element updated with new track');
                  }
                }, 50);
              }
            }
          }
        }
      } catch (err) {
        console.error(
          '❌ Error checking tracks for',
          userName || userId.slice(0, 6),
          ':',
          err
        );
      }
    }, 300);

    return () => {
      peer.off('stream', handleStream);
      streamHandledRef.current = false;
      if (trackCheckIntervalRef.current) {
        clearInterval(trackCheckIntervalRef.current);
      }
    };
  }, [peer, userId, userName]);

  // Display user name
  const displayName = userName || `User ${userId.slice(0, 6)}`;

  // Main view (when sharing screen - large view)
  if (isMainView) {
    return (
      <div className='relative w-full h-full flex items-center justify-center bg-black'>
        <video
          ref={ref}
          autoPlay
          playsInline
          className='max-w-full max-h-full object-contain'
        />

        {isSharing && (
          <div className='absolute top-6 left-6 px-4 py-2 bg-red-500 rounded-full flex items-center gap-2 shadow-lg'>
            <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
            <span className='text-sm text-white font-semibold'>
              {displayName} is presenting
            </span>
          </div>
        )}

        {(!isVideoEnabled || !hasStream) && (
          <div className='absolute inset-0 flex items-center justify-center bg-[#202124] z-10'>
            <div className='text-center'>
              <div className='w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-2xl'>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <p className='text-white font-medium'>{displayName}</p>
              {!hasStream ? (
                <p className='text-[#9aa0a6] text-sm mt-1'>
                  Loading presentation...
                </p>
              ) : (
                <p className='text-[#9aa0a6] text-sm mt-1'>Camera is off</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Thumbnail view (small sidebar)
  if (isThumbnail) {
    return (
      <div className='relative bg-[#3c4043] rounded-xl overflow-hidden aspect-video group hover:ring-2 hover:ring-[#8ab4f8] transition-all shadow-lg'>
        <video
          ref={ref}
          autoPlay
          playsInline
          className='w-full h-full object-cover'
        />

        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none'></div>

        <div className='absolute bottom-3 left-3 flex items-center gap-2'>
          <div
            className={`w-2 h-2 rounded-full ${hasStream ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
          ></div>
          <span className='text-sm font-medium text-white drop-shadow-lg'>
            {displayName}
          </span>
        </div>

        {(!isVideoEnabled || !hasStream) && (
          <div className='absolute inset-0 flex items-center justify-center bg-[#3c4043] z-10'>
            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl'>
                {displayName.charAt(0).toUpperCase()}
              </div>
              {!hasStream && (
                <p className='text-white text-xs font-medium mt-2'>
                  Connecting...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default grid view (normal layout) - Google Meet Style
  return (
    <div className='relative group h-full'>
      <div className='relative h-full rounded-2xl overflow-hidden bg-[#3c4043] shadow-xl hover:shadow-2xl transition-all'>
        <video
          ref={ref}
          autoPlay
          playsInline
          className='w-full h-full object-cover'
        />

        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none'></div>

        {/* Name Tag - Always visible like Google Meet */}
        <div className='absolute bottom-4 left-4 flex items-center gap-2'>
          <div
            className={`w-2 h-2 rounded-full ${hasStream ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
          ></div>
          <span className='text-sm font-medium text-white drop-shadow-lg'>
            {displayName}
          </span>
        </div>

        {/* Screen Share Badge */}
        {isSharing && (
          <div className='absolute top-4 right-4 px-3 py-1.5 bg-[#8ab4f8] rounded-lg flex items-center gap-1.5 shadow-lg'>
            <svg
              className='w-4 h-4 text-[#202124]'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-xs font-semibold text-[#202124]'>
              Presenting
            </span>
          </div>
        )}

        {/* Camera Off Avatar */}
        {(!isVideoEnabled || !hasStream) && (
          <div className='absolute inset-0 flex items-center justify-center bg-[#3c4043] z-10'>
            <div className='text-center'>
              <div className='w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold mb-3 shadow-2xl'>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <p className='text-white font-medium text-lg'>{displayName}</p>
              {!hasStream ? (
                <p className='text-[#9aa0a6] text-sm mt-1'>Connecting...</p>
              ) : (
                <p className='text-[#9aa0a6] text-sm mt-1'>Camera is off</p>
              )}
            </div>
          </div>
        )}

        {/* Hover Overlay - Google Meet Style */}
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none'></div>
      </div>
    </div>
  );
};
