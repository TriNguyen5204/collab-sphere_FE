import React, { useEffect, useRef, useState } from 'react';

export const ParticipantVideo = ({ peer, userId, userName, isSharing, isMainView = false, isThumbnail = false }) => {
  const ref = useRef();
  const [hasStream, setHasStream] = useState(false);
  const streamHandledRef = useRef(false);
  const trackCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (streamHandledRef.current) return;
    streamHandledRef.current = true;

    const handleStream = stream => {
      console.log('🎥 Video received from:', userName || userId.slice(0, 6));
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
            console.log('🔄 Creating initial stream for:', userName || userId.slice(0, 6));
            const newStream = new MediaStream([videoReceiver.track]);
            // Add audio if exists
            const audioReceiver = receivers?.find(r => r.track?.kind === 'audio');
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
            const trackChanged = currentVideoTrack.id !== videoReceiver.track.id;
            const trackEnded = currentVideoTrack.readyState === 'ended';
            
            if (trackChanged || trackEnded) {
              console.log('🔄 Track changed for:', userName || userId.slice(0, 6));
              console.log('   Reason:', trackChanged ? 'Different ID' : 'Track ended');
              console.log('   Old track:', currentVideoTrack.id.slice(0, 8), '| State:', currentVideoTrack.readyState);
              console.log('   New track:', videoReceiver.track.id.slice(0, 8), '| State:', videoReceiver.track.readyState);
              
              // Create new stream with ALL tracks
              const newStream = new MediaStream();
              
              // Add video track
              newStream.addTrack(videoReceiver.track);
              
              // Add audio track if exists
              const audioReceiver = receivers?.find(r => r.track?.kind === 'audio');
              if (audioReceiver?.track) {
                newStream.addTrack(audioReceiver.track);
              }
              
              if (ref.current) {
                // Force video element to reload
                ref.current.srcObject = null;
                setTimeout(() => {
                  if (ref.current) {
                    ref.current.srcObject = newStream;
                    ref.current.play().catch(e => console.warn('Play error:', e));
                    console.log('✅ Video element updated with new track');
                  }
                }, 50);
              }
            }
          }
        }
      } catch (err) {
        console.error('❌ Error checking tracks for', userName || userId.slice(0, 6), ':', err);
      }
    }, 300); // ✅ Check every 300ms (faster!)

    return () => {
      console.log('🧹 Cleaning up for:', userName || userId.slice(0, 6));
      peer.off('stream', handleStream);
      streamHandledRef.current = false;
      if (trackCheckIntervalRef.current) {
        clearInterval(trackCheckIntervalRef.current);
      }
    };
  }, [peer, userId, userName]);

  // Hiển thị tên user
  const displayName = userName || `User ${userId.slice(0, 6)}`;

  // Main view (khi đang share màn hình - view lớn)
  if (isMainView) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video 
          ref={ref} 
          autoPlay 
          playsInline 
          className="max-w-full max-h-full object-contain" 
        />
        
        {isSharing && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 rounded-lg flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm text-white font-semibold">
              {displayName} is presenting
            </span>
          </div>
        )}

        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-400">Loading presentation...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Thumbnail view (sidebar nhỏ)
  if (isThumbnail) {
    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group hover:ring-2 hover:ring-blue-500 transition-all">
        <video 
          ref={ref} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${hasStream ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-xs font-medium text-white drop-shadow-md">
            {displayName}
          </span>
        </div>

        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-8 h-8 border-3 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  // Default grid view (layout bình thường)
  return (
    <div className="relative group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all">
        <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasStream ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-sm font-semibold text-white drop-shadow-lg">
            {displayName}
          </span>
        </div>

        {isSharing && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
            🖥️ Sharing
          </div>
        )}

        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Connecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};