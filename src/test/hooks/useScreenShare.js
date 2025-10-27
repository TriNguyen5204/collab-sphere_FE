import { useRef, useState } from 'react';

export const useScreenShare = (peersRef, localStreamRef, roomId, socket) => {
  const [isSharing, setIsSharing] = useState(false);
  const [currentScreenStream, setCurrentScreenStream] = useState(null);
  const screenStreamRef = useRef(null);
  const isSharingRef = useRef(false);

  const shareScreen = async () => {
    if (!socket) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', displaySurface: 'monitor' },
        audio: false,
      });

      console.log('🖥️ Screen share started');
      
      // Update ALL state/refs TOGETHER
      screenStreamRef.current = screenStream;
      isSharingRef.current = true;
      setCurrentScreenStream(screenStream);
      setIsSharing(true);
      
      console.log('✅ Refs updated:', {
        isSharingRef: isSharingRef.current,
        hasScreenStream: !!screenStreamRef.current
      });

      socket.emit('screenShareStatus', { roomId, isSharing: true, userId: socket.id });

      const screenVideoTrack = screenStream.getVideoTracks()[0];

      // Replace tracks for all peers
      console.log('🔄 Replacing video tracks with screen...');
      console.log('🔍 Current peers:', Object.keys(peersRef.current));
      console.log('🔍 Peers count:', Object.keys(peersRef.current).length);
      
      let successCount = 0;
      
      Object.entries(peersRef.current).forEach(([userId, peer]) => {
        console.log('🔄 Processing peer:', userId.slice(0, 6));
        
        if (!peer) {
          console.warn(`⚠️ Peer is null for ${userId.slice(0, 6)}`);
          return;
        }
        
        if (!peer._pc) {
          console.warn(`⚠️ No peer._pc for ${userId.slice(0, 6)}`);
          return;
        }

        const senders = peer._pc.getSenders();
        console.log('🔍 Senders count:', senders.length);
        
        const videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoSender) {
          console.log('✅ Found video sender for:', userId.slice(0, 6));
          videoSender
            .replaceTrack(screenVideoTrack)
            .then(() => {
              console.log(`✅ Screen sent to ${userId.slice(0, 6)}`);
              successCount++;
            })
            .catch(err => console.error(`❌ Failed for ${userId.slice(0, 6)}:`, err));
        } else {
          console.warn(`⚠️ No video sender for ${userId.slice(0, 6)}`);
        }
      });

      setTimeout(() => {
        console.log(`📊 Screen share: ${successCount}/${Object.keys(peersRef.current).length} peers updated`);
      }, 1000);

      screenVideoTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error('❌ getDisplayMedia error:', err);
      if (err.name === 'NotAllowedError') {
        alert('Screen sharing permission denied');
      }
    }
  };

  const stopScreenShare = () => {
    if (!socket) return;

    console.log('🛑 Stopping screen share');

    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setCurrentScreenStream(null); // ✅ Clear state
    }

    isSharingRef.current = false;
    setIsSharing(false);

    socket.emit('screenShareStatus', { roomId, isSharing: false });

    const cam = localStreamRef.current;
    if (!cam) return;

    const camVideoTrack = cam.getVideoTracks()[0];
    if (!camVideoTrack) return;

    // Restore camera for all peers
    Object.entries(peersRef.current).forEach(([userId, peer]) => {
      if (!peer?._pc) return;

      const senders = peer._pc.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');

      if (videoSender) {
        videoSender
          .replaceTrack(camVideoTrack)
          .then(() => console.log(`✅ Camera restored for ${userId.slice(0, 6)}`))
          .catch(err => console.error(`❌ Failed for ${userId.slice(0, 6)}:`, err));
      }
    });
  };

  return {
    isSharing,
    isSharingRef, // ✅ Export ref
    screenStreamRef, // ✅ Export ref
    currentScreenStream,
    shareScreen,
    stopScreenShare,
  };
};