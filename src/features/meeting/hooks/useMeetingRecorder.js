import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import RecordRTC from 'recordrtc';
import { getRecordUrl } from '../services/meetingApi';
import useToastConfirmation from '../../../hooks/useToastConfirmation';

export const useMeetingRecorder = (
  socket,
  roomId,
  stream,
  handleRecordingComplete
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const recorderRef = useRef(null);
  const displayStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const confirmWithToast = useToastConfirmation();

  // Handle when someone starts recording
  useEffect(() => {
    if (!socket) return;

    const handleRecordStarted = ({ userId }) => {
      console.log(`Recording started by user: ${userId}`);
      setRecordingUserId(userId);
      if (userId !== socket.id) {
        setIsRecordingDisabled(true);
      }
    };

    const handleRecordStopped = ({ userId }) => {
      console.log(`Recording stopped by user: ${userId}`);
      setRecordingUserId(null);
      setIsRecordingDisabled(false);
    };

    socket.on('recordStarted', handleRecordStarted);
    socket.on('recordStopped', handleRecordStopped);

    return () => {
      socket.off('recordStarted', handleRecordStarted);
      socket.off('recordStopped', handleRecordStopped);
    };
  }, [socket]);

  const downloadVideoToDevice = useCallback((blob, timestamp) => {
    try {
      console.log('💾 Starting download to device...');
      setIsDownloading(true);

      // Create a download URL from blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `meeting_recording_${timestamp}.webm`;

      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 100);

      console.log('✅ Video download started to device');
      toast.success('📥 Recording downloaded to your device!', {
        duration: 3000,
        icon: '💾',
      });

      return true;
    } catch (error) {
      console.error('❌ Error downloading video:', error);
      toast.error('Failed to download video to device');
      setIsDownloading(false);
      return false;
    }
  }, []);

  // Cleanup function to ensure resources are released correctly
  const cleanupResources = useCallback(() => {
    console.log('🧹 Cleaning up recording resources...');

    // Stop recorder
    if (recorderRef.current) {
      try {
        if (recorderRef.current.state === 'recording') {
          recorderRef.current.stopRecording();
        }
        recorderRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying recorder:', e);
      }
      recorderRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn('Error closing audio context:', e);
      }
      audioContextRef.current = null;
    }

    // Stop display stream
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      displayStreamRef.current = null;
    }

    console.log('✅ Cleanup complete');
  }, []);
  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !isRecording) {
      console.log('No active recording to stop');
      return;
    }

    console.log('🛑 Stopping recording...');

    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current.getBlob();

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')
        .replace('T', '_');

      const downloadSuccess = downloadVideoToDevice(blob, timestamp);
      if (!downloadSuccess) {
        const isContinue = await confirmWithToast({
          message: 'Download Failed',
          description: 'Unable to save recording...',
          confirmLabel: 'Continue Upload',
          cancelLabel: 'Cancel & Discard',
          variant: 'danger',
        });
        if (!isContinue) {
          cleanupResources();
          setIsRecording(false);
          return;
        }
      }
      // Create File object from blob to upload
      const videoFile = new File([blob], `meeting_${timestamp}.webm`, {
        type: 'video/webm',
      });

      // ---- START UPLOAD LOGIC ----
      setIsUploading(true);
      setUploadProgress(0);

      try {
        setUploadProgress(30);

        // 1. Call API to upload and get URL
        const response = await getRecordUrl(videoFile);

        setUploadProgress(70); // Simulate progress

        const videoUrl = response.message;

        if (!videoUrl || typeof videoUrl !== 'string') {
          throw new Error('Invalid video URL received from server');
        }

        console.log('✅ Video uploaded, URL:', videoUrl);

        // 2. Call callback from MeetingRoomTest to call updateMeeting
        if (handleRecordingComplete) {
          await handleRecordingComplete(videoUrl);
        }

        setUploadProgress(100);
      } catch (error) {
        console.error('❌ Video upload or meeting update failed:', error);
        toast.error(
          'Error: Unable to upload video or update meeting. Please try again.'
        );
        setUploadProgress(0); // Reset if error
      } finally {
        setIsUploading(false); // Hide modal
      }
      // ---- END UPLOAD LOGIC ----

      // Cleanup resources
      cleanupResources();

      setIsRecording(false);

      if (socket && roomId) {
        socket.emit('requestStopRecord', roomId);
      }

      console.log('✅ Recording stopped and process finished');
    });
  }, [
    isRecording,
    socket,
    roomId,
    cleanupResources,
    handleRecordingComplete,
    downloadVideoToDevice,
    confirmWithToast,
  ]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!socket || !roomId) {
      console.error('Missing socket or roomId');
      return;
    }

    // Cleanup before starting new recording
    cleanupResources();

    socket.emit('requestStartRecord', roomId, async response => {
      if (!response.success) {
        toast.error(response.message || 'Unable to start recording.');
        return;
      }

      try {
        console.log('🎬 Starting recording process...');

        // Request user to select screen to record
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'browser',
            frameRate: { ideal: 30, max: 30 },
          },
          audio: true, // Enable audio from tab
          preferCurrentTab: true,
        });

        console.log('✅ Display stream obtained:', {
          videoTracks: displayStream.getVideoTracks().length,
          audioTracks: displayStream.getAudioTracks().length,
        });

        displayStreamRef.current = displayStream;

        // Listen when user stops sharing from browser
        displayStream.getVideoTracks()[0].onended = () => {
          console.log('User stopped screen sharing from browser UI');
          stopRecording();
        };

        // Create new AudioContext
        audioContextRef.current = new AudioContext();
        const audioContext = audioContextRef.current;
        const dest = audioContext.createMediaStreamDestination();

        let hasAudio = false;

        // 1. Audio from shared tab (system audio)
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          try {
            const tabAudioStream = new MediaStream([displayAudioTracks[0]]);
            const source = audioContext.createMediaStreamSource(tabAudioStream);
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0; // Volume 100%
            source.connect(gainNode);
            gainNode.connect(dest);
            hasAudio = true;
            console.log('✅ Tab audio connected');
          } catch (e) {
            console.warn('Failed to connect tab audio:', e);
          }
        }

        // 2. Audio from microphone
        if (stream) {
          const micAudioTracks = stream.getAudioTracks();
          if (micAudioTracks.length > 0) {
            try {
              const micStream = new MediaStream([micAudioTracks[0]]);
              const micSource = audioContext.createMediaStreamSource(micStream);
              const micGainNode = audioContext.createGain();
              micGainNode.gain.value = 1.0; // Volume 100%
              micSource.connect(micGainNode);
              micGainNode.connect(dest);
              hasAudio = true;
            } catch (e) {
              console.warn('Failed to connect mic audio:', e);
            }
          }
        }

        // Create final stream
        const finalStream = new MediaStream();

        // Add video track
        const videoTrack = displayStream.getVideoTracks()[0];
        finalStream.addTrack(videoTrack);
        console.log('✅ Video track added:', videoTrack.getSettings());

        // Add mixed audio track
        if (hasAudio && dest.stream.getAudioTracks().length > 0) {
          const audioTrack = dest.stream.getAudioTracks()[0];
          finalStream.addTrack(audioTrack);
          console.log('✅ Audio track added:', audioTrack.getSettings());
        } else {
          console.warn('⚠️ No audio tracks available');
        }

        // Wait a bit for stream to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialize RecordRTC with optimal config
        const recorderOptions = {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 2500000, // 2.5 Mbps
          audioBitsPerSecond: 128000,
          frameRate: 30,
          // ensure RecordRTC waits for stream to be ready
          initCallback: function () {
            console.log('RecordRTC initialized');
          },
        };

        // Fallback mimeType if vp9 is not supported
        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
          recorderOptions.mimeType = 'video/webm;codecs=vp8,opus';
          console.log('Fallback to vp8');
        }

        recorderRef.current = new RecordRTC(finalStream, recorderOptions);

        // Start recording
        recorderRef.current.startRecording();
        setIsRecording(true);

        console.log('✅ Recording started successfully');
        console.log('Stream info:', {
          videoTracks: finalStream.getVideoTracks().length,
          audioTracks: finalStream.getAudioTracks().length,
          videoEnabled: finalStream.getVideoTracks()[0]?.enabled,
          audioEnabled: finalStream.getAudioTracks()[0]?.enabled,
        });
      } catch (err) {
        console.error('❌ Recording error:', err);

        cleanupResources();

        if (err.name === 'NotAllowedError') {
          toast.error(
            'You need to allow screen sharing to record the meeting.'
          );
        } else if (err.name === 'NotFoundError') {
          toast.error('No screen source found for recording.');
        } else {
          toast.error('Error starting recording: ' + err.message);
        }

        socket.emit('requestStopRecord', roomId);
      }
    });
  }, [socket, roomId, cleanupResources, stream, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        console.log('Component unmounting, stopping recording...');
        cleanupResources();
        if (socket && roomId) {
          socket.emit('requestStopRecord', roomId);
        }
      }
    };
  }, [isRecording, socket, roomId, cleanupResources]);

  return {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    startRecording,
    stopRecording,
    isUploading,
    uploadProgress,
    isDownloading,
  };
};
