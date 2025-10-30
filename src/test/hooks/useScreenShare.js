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

      screenStreamRef.current = screenStream;
      isSharingRef.current = true;
      setCurrentScreenStream(screenStream);
      setIsSharing(true);

      socket.emit('screenShareStatus', { roomId, isSharing: true, userId: socket.id });

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(peer => {
        if (!peer?._pc) return;
        const senders = peer._pc.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender && screenVideoTrack) {
          videoSender.replaceTrack(screenVideoTrack).catch(()=>{});
        }
      });

      screenVideoTrack.onended = () => stopScreenShare();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        alert('Screen sharing permission denied');
      }
    }
  };

  const stopScreenShare = () => {
    if (!socket) return;

    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setCurrentScreenStream(null);
    }

    isSharingRef.current = false;
    setIsSharing(false);

    socket.emit('screenShareStatus', { roomId, isSharing: false });

    const cam = localStreamRef.current;
    if (!cam) return;

    const camVideoTrack = cam.getVideoTracks()[0];
    if (!camVideoTrack) return;

    Object.values(peersRef.current).forEach(peer => {
      if (!peer?._pc) return;
      const senders = peer._pc.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      if (videoSender) {
        videoSender.replaceTrack(camVideoTrack).catch(()=>{});
      }
    });
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
