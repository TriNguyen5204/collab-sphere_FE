import { useRef, useState } from 'react';
import { toast } from 'sonner';

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

      screenStreamRef.current = screenStream;
      isSharingRef.current = true;
      setCurrentScreenStream(screenStream);
      setIsSharing(true);

      console.log('🖥️ Starting screen share...');

      // Emit screen share status
      socket.emit('screenShareStatus', { roomId, isSharing: true, userId: socket.id });

      // Replace video track for all peers
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(peer => {
        if (!peer?._pc) return;
        const senders = peer._pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender && screenVideoTrack) {
          videoSender.replaceTrack(screenVideoTrack)
            .then(() => {
              console.log('✅ Screen track sent to peer');
            })
            .catch((err) => {
              console.error('❌ Failed to replace track:', err);
            });
        }
      });

      // Handle when user stops sharing from browser
      screenVideoTrack.onended = () => {
        console.log('🛑 Screen share ended by user');
        stopScreenShare();
      };
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied');
      } else {
        console.error('❌ Screen share error:', err);
      }
    }
  };

  const stopScreenShare = () => {
    if (!socket) return;

    console.log('🛑 Stopping screen share...');

    // Stop all tracks of screen stream
    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Stopped screen track:', track.id.slice(0, 8));
      });
      screenStreamRef.current = null;
      setCurrentScreenStream(null);
    }

    // Update state
    isSharingRef.current = false;
    setIsSharing(false);

    // Emit screen share stopped
    socket.emit('screenShareStatus', { roomId, isSharing: false });

    // Restore camera track for all peers
    const cam = localStreamRef.current;
    if (!cam) {
      console.warn('⚠️ No camera stream to restore!');
      return;
    }

    const camVideoTrack = cam.getVideoTracks()[0];
    if (!camVideoTrack) {
      console.warn('⚠️ No camera video track found!');
      return;
    }

    console.log('📹 Restoring camera track:', camVideoTrack.id.slice(0, 8));

    // Replace track for all peers
    Object.values(peersRef.current).forEach(peer => {
      if (!peer?._pc) return;
      const senders = peer._pc.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(camVideoTrack)
          .then(() => {
            console.log('✅ Camera track restored for peer');
          })
          .catch((err) => {
            console.error('❌ Failed to restore camera track:', err);
          });
      }
    });

    console.log('✅ Screen share stopped successfully');
  };

  return {
    isSharing,
    isSharingRef,
    screenStreamRef,
    currentScreenStream,
    shareScreen,
    stopScreenShare,
  };
};