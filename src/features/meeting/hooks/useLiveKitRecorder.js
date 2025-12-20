import { useState, useRef, useCallback, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import { toast } from 'sonner';
import { getRecordUrl, updateMeeting } from '../services/meetingApi';
import useToastConfirmation from '../../../hooks/useToastConfirmation';

/**
 * Recording hook for LiveKit meetings
 * Adapted from old socket.io-based useMeetingRecorder for LiveKit data channels
 * 
 * Features:
 * - Screen recording with audio mixing (tab audio + microphone)
 * - Single recorder enforcement via data channel broadcast
 * - Auto-download and upload to server
 * - Edge case handling (screen share denied, track ended, upload failure, etc.)
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.meetingId - Meeting ID for saving record URL
 * @param {string} options.currentUserId - Current user's ID
 * @param {Function} options.sendDataChannelMessage - Function to send data channel messages
 * @param {Function} options.onRecordingComplete - Callback when recording is saved (optional)
 * @returns {Object} Recording states and controls
 */
const useLiveKitRecorder = ({
  meetingId,
  currentUserId,
  sendDataChannelMessage,
  onRecordingComplete,
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  // Refs for cleanup
  const recorderRef = useRef(null);
  const displayStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const combinedStreamRef = useRef(null);

  // useToastConfirmation returns the function directly, NOT an object
  const confirmWithToast = useToastConfirmation();

  /**
   * Check if VP9 codec is supported, fallback to VP8
   */
  const getVideoCodec = useCallback(() => {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('[Recording] Using codec:', mimeType);
        return mimeType;
      }
    }

    console.warn('[Recording] No supported codec found, using default');
    return 'video/webm';
  }, []);

  /**
   * Download video to user's device
   */
  const downloadVideoToDevice = useCallback(async (blob, filename) => {
    setIsDownloading(true);
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || `meeting-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup after download starts
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('[Recording] Video downloaded to device');
      return true;
    } catch (error) {
      console.error('[Recording] Download failed:', error);
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  /**
   * Upload video to server and update meeting record
   */
  const uploadAndSaveRecording = useCallback(async (blob) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const videoFile = new File(
        [blob],
        `meeting-${meetingId}-${Date.now()}.webm`,
        { type: blob.type || 'video/webm' }
      );

      console.log('[Recording] Uploading video file:', videoFile.name, 'Size:', videoFile.size);

      // Simulate upload progress (actual progress requires axios config)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Upload to server
      const uploadResponse = await getRecordUrl(videoFile);
      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('[Recording] Upload response:', uploadResponse);

      // Extract URL from response
      const recordUrl = uploadResponse?.result?.downloadUrl 
        || uploadResponse?.result?.url 
        || uploadResponse?.url;

      if (!recordUrl) {
        throw new Error('No download URL in upload response');
      }

      // Update meeting with record URL
      await updateMeeting({
        meetingId,
        recordUrl,
      });

      console.log('[Recording] Meeting updated with record URL:', recordUrl);

      // Show success notification
      toast.success('Recording saved successfully!', {
        description: 'The meeting recording has been uploaded and saved.',
        duration: 5000,
      });

      // Callback for parent component
      if (onRecordingComplete) {
        onRecordingComplete(recordUrl);
      }

      return recordUrl;
    } catch (error) {
      console.error('[Recording] Upload/save failed:', error);
      setRecordingError(error.message || 'Upload failed');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [meetingId, onRecordingComplete]);

  /**
   * Clean up all recording resources
   */
  const cleanupResources = useCallback(() => {
    console.log('[Recording] Cleaning up resources...');

    // Stop and destroy recorder
    if (recorderRef.current) {
      try {
        if (recorderRef.current.state !== 'inactive') {
          recorderRef.current.stopRecording(() => {});
        }
        recorderRef.current.destroy();
      } catch (e) {
        console.warn('[Recording] Recorder cleanup error:', e);
      }
      recorderRef.current = null;
    }

    // Stop display stream tracks
    if (displayStreamRef.current) {
      try {
        displayStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('[Recording] Stopped display track:', track.kind, track.label);
        });
      } catch (e) {
        console.warn('[Recording] Error stopping display tracks:', e);
      }
      displayStreamRef.current = null;
    }

    // Stop combined stream tracks
    if (combinedStreamRef.current) {
      try {
        combinedStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('[Recording] Stopped combined track:', track.kind, track.label);
        });
      } catch (e) {
        console.warn('[Recording] Error stopping combined tracks:', e);
      }
      combinedStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.warn('[Recording] AudioContext cleanup error:', e);
      }
      audioContextRef.current = null;
    }
  }, []);

  /**
   * Start screen recording with audio
   */
  const startRecording = useCallback(async () => {
    // Prevent if someone else is already recording
    if (isRecordingDisabled) {
      console.warn('[Recording] Recording is disabled - another user is recording');
      return false;
    }

    // Prevent double recording
    if (isRecording || recorderRef.current) {
      console.warn('[Recording] Already recording');
      return false;
    }

    setRecordingError(null);

    try {
      console.log('[Recording] Starting screen capture...');

      // Request screen share with system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      displayStreamRef.current = displayStream;

      // Handle user stopping screen share from browser UI
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          console.log('[Recording] User stopped screen sharing from browser UI');
          stopRecording();
        });
      }

      // Setup audio mixing: tab audio + microphone
      let combinedStream = displayStream;
      const displayAudioTrack = displayStream.getAudioTracks()[0];

      if (displayAudioTrack) {
        try {
          // Get microphone audio
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            },
          });

          // Create audio context for mixing
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;

          // Create audio sources
          const displayAudioSource = audioContext.createMediaStreamSource(
            new MediaStream([displayAudioTrack])
          );
          const micAudioSource = audioContext.createMediaStreamSource(micStream);

          // Create gain nodes for volume control
          const displayGain = audioContext.createGain();
          const micGain = audioContext.createGain();
          displayGain.gain.value = 1.0;
          micGain.gain.value = 1.0;

          // Create destination for mixed audio
          const destination = audioContext.createMediaStreamDestination();

          // Connect audio graph
          displayAudioSource.connect(displayGain);
          micAudioSource.connect(micGain);
          displayGain.connect(destination);
          micGain.connect(destination);

          // Create combined stream with video + mixed audio
          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ]);

          combinedStreamRef.current = combinedStream;
          console.log('[Recording] Audio mixing setup complete');
        } catch (micError) {
          console.warn('[Recording] Microphone access failed, using tab audio only:', micError);
          // Continue with just display stream
        }
      } else {
        console.log('[Recording] No tab audio available');
      }

      // Initialize RecordRTC
      const mimeType = getVideoCodec();
      const recorder = new RecordRTC(combinedStream, {
        type: 'video',
        mimeType,
        disableLogs: false,
        timeSlice: 1000, // Get data every second
        bitsPerSecond: 2500000, // 2.5 Mbps
        videoBitsPerSecond: 2000000,
        audioBitsPerSecond: 128000,
      });

      recorderRef.current = recorder;
      
      // Start recording
      recorder.startRecording();

      // Update state immediately
      setIsRecording(true);
      setRecordingUserId(currentUserId);

      // Broadcast recording started to all participants
      if (sendDataChannelMessage) {
        sendDataChannelMessage({
          type: 'RECORDING_STARTED',
          payload: {
            userId: currentUserId,
            timestamp: Date.now(),
          },
        });
      }

      console.log('[Recording] Recording started successfully');
      return true;
    } catch (error) {
      console.error('[Recording] Failed to start:', error);
      cleanupResources();

      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        setRecordingError('Screen sharing was denied. Please allow screen sharing to record.');
      } else if (error.name === 'NotFoundError') {
        setRecordingError('No screen source found. Please try again.');
      } else {
        setRecordingError(error.message || 'Failed to start recording');
      }

      return false;
    }
  }, [
    isRecording,
    isRecordingDisabled,
    currentUserId,
    sendDataChannelMessage,
    cleanupResources,
    getVideoCodec,
  ]);

  /**
   * Stop recording and process the video
   */
  const stopRecording = useCallback(async () => {
    // Check ref directly to ensure we have the latest instance
    if (!recorderRef.current) {
      console.warn('[Recording] No recorder instance found');
      return false;
    }

    console.log('[Recording] Stopping recording...');

    return new Promise((resolve) => {
      // Safety check for recorder state
      if (recorderRef.current.state === 'inactive') {
         console.warn('[Recording] Recorder is already inactive');
         setIsRecording(false);
         setRecordingUserId(null);
         resolve(false);
         return;
      }

      recorderRef.current.stopRecording(async () => {
        try {
          const blob = recorderRef.current.getBlob();
          console.log('[Recording] Got blob:', blob.size, 'bytes');

          // Update states first
          setIsRecording(false);
          setRecordingUserId(null);

          // Stop screen sharing immediately so the UI updates
          // This removes the "Sharing this tab to..." banner immediately
          cleanupResources();

          // Broadcast recording stopped
          if (sendDataChannelMessage) {
            sendDataChannelMessage({
              type: 'RECORDING_STOPPED',
              payload: {
                userId: currentUserId,
                timestamp: Date.now(),
              },
            });
          }

          // Generate filename
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `meeting-${meetingId}-${timestamp}.webm`;

          // Download to device first
          await downloadVideoToDevice(blob, filename);

          // Try to upload to server
          try {
            await uploadAndSaveRecording(blob);
            console.log('[Recording] Recording saved successfully');
            resolve(true);
          } catch (uploadError) {
            console.error('[Recording] Upload failed:', uploadError);

            // Ask user if they want to retry upload
            const shouldRetry = await confirmWithToast(
              'Upload failed. The recording has been downloaded to your device. Would you like to retry uploading to save it to the meeting?',
              {
                confirmLabel: 'Retry Upload',
                cancelLabel: 'Skip',
              }
            );

            if (shouldRetry) {
              try {
                await uploadAndSaveRecording(blob);
                resolve(true);
              } catch (retryError) {
                console.error('[Recording] Retry upload failed:', retryError);
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }
        } catch (error) {
          console.error('[Recording] Stop recording error:', error);
          setRecordingError(error.message);
          resolve(false);
        } finally {
          // Ensure resources are cleaned up if something failed before
          cleanupResources();
        }
      });
    });
  }, [
    isRecording,
    currentUserId,
    meetingId,
    sendDataChannelMessage,
    downloadVideoToDevice,
    uploadAndSaveRecording,
    cleanupResources,
    confirmWithToast,
  ]);

  /**
   * Handle data channel messages for recording state sync
   */
  const handleRecordingMessage = useCallback((message) => {
    if (!message || !message.type) return;

    switch (message.type) {
      case 'RECORDING_STARTED':
        if (message.payload?.userId !== currentUserId) {
          console.log('[Recording] Another user started recording:', message.payload?.userId);
          setIsRecordingDisabled(true);
          setRecordingUserId(message.payload?.userId);
        }
        break;

      case 'RECORDING_STOPPED':
        if (message.payload?.userId !== currentUserId) {
          console.log('[Recording] Another user stopped recording:', message.payload?.userId);
          setIsRecordingDisabled(false);
          setRecordingUserId(null);
        }
        break;

      default:
        // Ignore other message types
        break;
    }
  }, [currentUserId]);

  /**
   * Toggle recording state
   */
  const toggleRecording = useCallback(async () => {
    // Use ref to check actual recorder state as fallback
    if (isRecording || (recorderRef.current && recorderRef.current.state === 'recording')) {
      return await stopRecording();
    } else {
      return await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  /**
   * Cleanup on unmount
   * We use a ref to track recording state to avoid dependency cycles in useEffect
   */
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        console.log('[Recording] Component unmounting, stopping recording...');
        // We can't call stopRecording here because it might be stale or cause issues
        // Just ensure resources are cleaned up
        if (recorderRef.current) {
          try {
            recorderRef.current.stopRecording(() => {
               // Try to save if possible, or just cleanup
               cleanupResources();
            });
          } catch (e) {
            cleanupResources();
          }
        } else {
          cleanupResources();
        }
      } else {
        cleanupResources();
      }
    };
  }, [cleanupResources]);

  /**
   * Clear error after timeout
   */
  useEffect(() => {
    if (recordingError) {
      const timer = setTimeout(() => {
        setRecordingError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recordingError]);

  return {
    // States
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    isUploading,
    uploadProgress,
    isDownloading,
    recordingError,

    // Actions
    startRecording,
    stopRecording,
    toggleRecording,
    handleRecordingMessage,

    // Utilities
    cleanupResources,
  };
};

export default useLiveKitRecorder;
