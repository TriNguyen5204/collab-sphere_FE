import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { getRecordUrl, updateMeeting } from '../services/meetingApi';
import useToastConfirmation from '../../../hooks/useToastConfirmation';

/**
 * Modern Recording Hook using Native MediaRecorder API
 * Replaces legacy RecordRTC implementation.
 * 
 * Features:
 * - Native MediaRecorder (VP9/VP8/H.264 support)
 * - Robust Audio Mixing (System Audio + Mic)
 * - Memory efficient chunk handling
 * - Auto-upload with retry mechanism
 */
const useLiveKitRecorder = ({
  meetingId,
  meetingTitle, // Add meetingTitle prop
  currentUserId,
  sendDataChannelMessage,
  onRecordingComplete,
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingError, setRecordingError] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const confirmWithToast = useToastConfirmation();

  // 1. Get Best Supported MimeType
  const getSupportedMimeType = useCallback(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4',
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
  }, []);

  // 2. Cleanup Function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  // 3. Upload Logic
  const handleUpload = useCallback(async (blob) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const file = new File([blob], `meeting-${meetingId}-${Date.now()}.webm`, {
        type: blob.type
      });

      // Use the new progress-enabled API
      const response = await getRecordUrl(file, (percent) => {
        setUploadProgress(percent);
      });

      console.log('[Recorder] Upload response:', response);

      // Robust URL extraction
      const recordUrl = typeof response === 'string' ? response : 
        (response?.result?.downloadUrl || response?.result?.url || response?.url || response?.data || response?.fileUrl || response?.message);

      if (!recordUrl) throw new Error('Invalid upload response structure: ' + JSON.stringify(response));

      // Update meeting with recordUrl AND required title
      await updateMeeting({ 
        meetingId, 
        recordUrl,
        title: meetingTitle || `Meeting Recording - ${new Date().toLocaleString()}` // Use meetingTitle if available
      });
      
      toast.success('Recording saved successfully');
      if (onRecordingComplete) onRecordingComplete(recordUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      setRecordingError('Upload failed. Video saved locally.');
      
      // Auto-download backup if upload fails
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BACKUP-meeting-${meetingId}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsUploading(false);
    }
  }, [meetingId, onRecordingComplete]);

  // 4. Start Recording
  const startRecording = useCallback(async () => {
    if (isRecordingDisabled) return toast.error('Someone else is already recording');
    
    try {
      // A. Capture Screen (System Audio is crucial here)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true } // Request system audio
      });

      // Check if user shared system audio
      const hasSystemAudio = displayStream.getAudioTracks().length > 0;
      if (!hasSystemAudio) {
        toast.warning('System audio not shared!', {
          description: 'Remote participants will NOT be heard. Please restart and check "Share system audio".'
        });
      }

      // B. Capture Mic (Local User Audio)
      let micStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      } catch (e) {
        console.warn('Mic access denied', e);
      }

      // C. Mix Audio Streams
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const dest = audioContext.createMediaStreamDestination();

      if (hasSystemAudio) {
        const sysSource = audioContext.createMediaStreamSource(displayStream);
        const sysGain = audioContext.createGain();
        sysGain.gain.value = 1.0;
        sysSource.connect(sysGain).connect(dest);
      }

      if (micStream) {
        const micSource = audioContext.createMediaStreamSource(micStream);
        const micGain = audioContext.createGain();
        micGain.gain.value = 1.0; // Adjust if mic is too loud
        micSource.connect(micGain).connect(dest);
      }

      // D. Create Final Mixed Stream
      const mixedTracks = [
        ...displayStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ];
      const finalStream = new MediaStream(mixedTracks);
      streamRef.current = finalStream;

      // E. Setup MediaRecorder
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 2500000 });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await handleUpload(blob);
        cleanup();
        setIsRecording(false);
        setRecordingUserId(null);
        
        // Notify others
        if (sendDataChannelMessage) {
          sendDataChannelMessage({
            type: 'RECORDING_STOPPED',
            payload: { userId: currentUserId }
          });
        }
      };

      // Handle "Stop Sharing" native button
      displayStream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') recorder.stop();
      };

      recorder.start(1000); // Slice every 1s
      setIsRecording(true);
      setRecordingUserId(currentUserId);

      // Notify others
      if (sendDataChannelMessage) {
        sendDataChannelMessage({
          type: 'RECORDING_STARTED',
          payload: { userId: currentUserId }
        });
      }

    } catch (error) {
      console.error('Start recording error:', error);
      cleanup();
      setRecordingError(error.message);
    }
  }, [isRecordingDisabled, currentUserId, getSupportedMimeType, handleUpload, cleanup, sendDataChannelMessage]);

  // 5. Stop Recording
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 6. Handle Remote Events
  const handleRecordingMessage = useCallback((msg) => {
    if (msg.type === 'RECORDING_STARTED' && msg.payload.userId !== currentUserId) {
      setIsRecordingDisabled(true);
      setRecordingUserId(msg.payload.userId);
    } else if (msg.type === 'RECORDING_STOPPED') {
      setIsRecordingDisabled(false);
      setRecordingUserId(null);
    }
  }, [currentUserId]);

  return {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    isUploading,
    uploadProgress,
    recordingError,
    startRecording,
    stopRecording,
    handleRecordingMessage
  };
};

export default useLiveKitRecorder;
