import React, { useEffect, useRef, useState } from 'react';

export const ParticipantVideo = ({ peer, userId, isSharing }) => {
  const ref = useRef();
  const [hasStream, setHasStream] = useState(false);
  const streamHandledRef = useRef(false);
  const trackCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (streamHandledRef.current) return;
    streamHandledRef.current = true;

    const handleStream = stream => {
      console.log('🎥 Video received from:', userId.slice(0, 6));
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
            console.log('🔄 Creating initial stream for:', userId.slice(0, 6));
            const newStream = new MediaStream([videoReceiver.track]);
            if (ref.current) {
              ref.current.srcObject = newStream;
              setHasStream(true);
            }
            return;
          }
          
          const currentVideoTrack = currentStream.getVideoTracks()[0];

          if (currentVideoTrack && currentVideoTrack.id !== videoReceiver.track.id) {
            console.log('🔄 Track changed for:', userId.slice(0, 6));
            console.log('   Old track:', currentVideoTrack.id.slice(0, 8));
            console.log('   New track:', videoReceiver.track.id.slice(0, 8));
            
            // Create new stream with updated track
            const newStream = new MediaStream([videoReceiver.track]);
            // Also add audio if exists
            const audioReceiver = receivers?.find(r => r.track?.kind === 'audio');
            if (audioReceiver?.track) {
              newStream.addTrack(audioReceiver.track);
            }
            
            if (ref.current) {
              ref.current.srcObject = newStream;
              console.log('✅ Video element updated with new track');
            }
          }
        }
      } catch (err) {
        console.error('❌ Error checking tracks for', userId.slice(0, 6), ':', err);
      }
    }, 500); // Check every 500ms for faster detection

    return () => {
      console.log('🧹 Cleaning up for:', userId.slice(0, 6));
      peer.off('stream', handleStream);
      streamHandledRef.current = false;
      if (trackCheckIntervalRef.current) {
        clearInterval(trackCheckIntervalRef.current);
      }
    };
  }, [peer, userId]);

  return (
    <div className="relative group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all">
        <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasStream ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <span className="text-sm font-semibold text-white drop-shadow-lg">
            Peer {userId.slice(0, 6)}
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