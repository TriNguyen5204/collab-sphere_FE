import { useEffect, useRef, useState } from 'react';

export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        localStreamRef.current = mediaStream;
        console.log('✅ Media stream initialized');
      } catch (err) {
        console.error('❌ Permission error:', err);
      }
    };

    initMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('🎤 Audio:', audioTrack.enabled ? 'ON' : 'OFF');
        return audioTrack.enabled;
      }
    }
    return false;
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('📹 Video:', videoTrack.enabled ? 'ON' : 'OFF');
        return videoTrack.enabled;
      }
    }
    return false;
  };

  return {
    stream,
    localStreamRef,
    toggleAudio,
    toggleVideo,
  };
};