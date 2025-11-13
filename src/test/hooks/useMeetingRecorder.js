import { useState, useRef, useCallback, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import { getRecordUrl } from '../../services/meetingApi';

export const useMeetingRecorder = (
  socket,
  roomId,
  stream,
  handleRecordingComplete
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState(null);
  const recorderRef = useRef(null);
  const displayStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Xử lý khi có người bắt đầu record
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

  // Cleanup function để đảm bảo resources được giải phóng đúng
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
  // Dừng recording
  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !isRecording) {
      console.log('No active recording to stop');
      return;
    }

    console.log('🛑 Stopping recording...');

    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current.getBlob();

      console.log('✅ Recording blob created:', {
        size: blob.size,
        type: blob.type,
      });

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')
        .replace('T', '_');

      // Tạo File object từ blob để upload
      const videoFile = new File([blob], `meeting_${timestamp}.webm`, {
        type: 'video/webm',
      });

      // ---- BẮT ĐẦU LOGIC UPLOAD ----
      setIsUploading(true);
      setUploadProgress(0);

      try {
        console.log('📤 Uploading video file...');
        setUploadProgress(30); // Mô phỏng tiến độ

        // 1. Gọi API để upload và lấy URL
        // Giả định response.data là URL string hoặc object { url: '...' }
        const response = await getRecordUrl(videoFile);

        setUploadProgress(70); // Mô phỏng tiến độ

        // Trích xuất URL. Tùy chỉnh nếu API trả về cấu trúc khác
        const videoUrl = response.message ;

        if (!videoUrl || typeof videoUrl !== 'string') {
          throw new Error('Không nhận được URL video hợp lệ từ server');
        }

        console.log('✅ Video uploaded, URL:', videoUrl);

        // 2. Gọi callback từ MeetingRoomTest để nó gọi updateMeeting
        if (handleRecordingComplete) {
          await handleRecordingComplete(videoUrl);
        }

        setUploadProgress(100); // Hoàn tất
      } catch (error) {
        console.error('❌ Video upload or meeting update failed:', error);
        alert(
          'Lỗi: Không thể tải video lên hoặc cập nhật meeting. Vui lòng thử lại.'
        );
        setUploadProgress(0); // Reset nếu lỗi
      } finally {
        setIsUploading(false); // Ẩn modal
      }
      // ---- KẾT THÚC LOGIC UPLOAD ----

      // Cleanup resources
      cleanupResources();

      setIsRecording(false);

      if (socket && roomId) {
        socket.emit('requestStopRecord', roomId);
      }

      console.log('✅ Recording stopped and process finished');
    });
  }, [isRecording, socket, roomId, cleanupResources, handleRecordingComplete]);

  // Bắt đầu recording
  const startRecording = useCallback(async () => {
    if (!socket || !roomId) {
      console.error('Missing socket or roomId');
      return;
    }

    // Cleanup trước khi bắt đầu recording mới
    cleanupResources();

    socket.emit('requestStartRecord', roomId, async response => {
      if (!response.success) {
        alert(response.message || 'Không thể bắt đầu ghi.');
        return;
      }

      try {
        console.log('🎬 Starting recording process...');

        // Yêu cầu user chọn màn hình để record
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'browser',
            frameRate: { ideal: 30, max: 30 },
          },
          audio: true, // Bật audio từ tab
          preferCurrentTab: true,
        });

        console.log('✅ Display stream obtained:', {
          videoTracks: displayStream.getVideoTracks().length,
          audioTracks: displayStream.getAudioTracks().length,
        });

        displayStreamRef.current = displayStream;

        // Lắng nghe khi user dừng share từ browser
        displayStream.getVideoTracks()[0].onended = () => {
          console.log('User stopped screen sharing from browser UI');
          stopRecording();
        };

        // Tạo AudioContext mới
        audioContextRef.current = new AudioContext();
        const audioContext = audioContextRef.current;
        const dest = audioContext.createMediaStreamDestination();

        let hasAudio = false;

        // 1. Audio từ tab được share (system audio)
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

        // 2. Audio từ microphone
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
              console.log('✅ Microphone audio connected');
            } catch (e) {
              console.warn('Failed to connect mic audio:', e);
            }
          }
        }

        // Tạo stream cuối cùng
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

        // Đợi một chút để stream ổn định
        await new Promise(resolve => setTimeout(resolve, 500));

        // Khởi tạo RecordRTC với config tối ưu
        const recorderOptions = {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 2500000, // 2.5 Mbps
          audioBitsPerSecond: 128000,
          frameRate: 30,
          // Quan trọng: đảm bảo RecordRTC chờ stream sẵn sàng
          initCallback: function () {
            console.log('RecordRTC initialized');
          },
        };

        // Fallback mimeType nếu vp9 không được hỗ trợ
        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
          recorderOptions.mimeType = 'video/webm;codecs=vp8,opus';
          console.log('Fallback to vp8');
        }

        recorderRef.current = new RecordRTC(finalStream, recorderOptions);

        // Bắt đầu recording
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
          alert('Bạn cần cho phép chia sẻ màn hình để ghi meeting.');
        } else if (err.name === 'NotFoundError') {
          alert('Không tìm thấy nguồn màn hình để ghi.');
        } else {
          alert('Lỗi khi bắt đầu ghi: ' + err.message);
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
  };
};
