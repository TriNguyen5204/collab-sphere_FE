import { useState, useRef, useCallback, useEffect } from 'react';
import RecordRTC from 'recordrtc';

export const useMeetingRecorder = (socket, roomId, stream) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState(null);
  const recorderRef = useRef(null);
  const displayStreamRef = useRef(null);

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

  // Bắt đầu recording - capture màn hình
  const startRecording = useCallback(async () => {
    if (!socket || !roomId) {
      console.error('Missing socket or roomId');
      return;
    }

    socket.emit('requestStartRecord', roomId, async (response) => {
      if (!response.success) {
        alert(response.message || 'Không thể bắt đầu ghi.');
        return;
      }

      try {
        // Yêu cầu user chọn tab/window để record
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always', // Hiển thị con trỏ chuột
            displaySurface: 'browser', // Ưu tiên browser tab
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          },
          preferCurrentTab: true // Chrome hỗ trợ - tự chọn tab hiện tại
        });

        displayStreamRef.current = displayStream;

        // Lắng nghe sự kiện user dừng share từ browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          console.log('User stopped screen sharing from browser');
          stopRecording();
        };

        // Mix audio: screen audio + microphone (nếu có)
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();

        // Audio từ màn hình share
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          const source = audioContext.createMediaStreamSource(
            new MediaStream([displayAudioTracks[0]])
          );
          source.connect(dest);
          console.log('✅ Screen audio added');
        }

        // Audio từ microphone (stream hiện tại)
        if (stream) {
          const micAudioTracks = stream.getAudioTracks();
          if (micAudioTracks.length > 0) {
            const micSource = audioContext.createMediaStreamSource(
              new MediaStream([micAudioTracks[0]])
            );
            micSource.connect(dest);
            console.log('✅ Microphone audio added');
          }
        }

        // Tạo stream cuối cùng: video từ screen + mixed audio
        const finalStream = new MediaStream();
        displayStream.getVideoTracks().forEach(track => finalStream.addTrack(track));
        dest.stream.getAudioTracks().forEach(track => finalStream.addTrack(track));

        // Khởi tạo RecordRTC
        recorderRef.current = new RecordRTC(finalStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 5000000, // 5 Mbps cho chất lượng tốt
          audioBitsPerSecond: 128000,
          frameRate: 30,
        });

        // Lưu audioContext để cleanup
        recorderRef.current._audioContext = audioContext;
        recorderRef.current._displayStream = displayStream;

        recorderRef.current.startRecording();
        setIsRecording(true);
        console.log('✅ Screen recording started');

      } catch (err) {
        console.error('Recording error:', err);
        
        // Xử lý các lỗi phổ biến
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
  }, [socket, roomId, stream]);

  // Dừng recording
  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !isRecording) return;

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      
      // Tạo tên file với timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')
        .replace('T', '_');
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `meeting_${timestamp}.webm`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Cleanup
      if (recorderRef.current._audioContext) {
        recorderRef.current._audioContext.close();
      }
      
      if (recorderRef.current._displayStream) {
        recorderRef.current._displayStream.getTracks().forEach(track => track.stop());
      }
      
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach(track => track.stop());
        displayStreamRef.current = null;
      }
      
      recorderRef.current = null;
      setIsRecording(false);
      
      if (socket && roomId) {
        socket.emit('requestStopRecord', roomId);
      }
      
      console.log('✅ Recording stopped and saved');
    });
  }, [isRecording, socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording && recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          if (recorderRef.current?._audioContext) {
            recorderRef.current._audioContext.close();
          }
          if (recorderRef.current?._displayStream) {
            recorderRef.current._displayStream.getTracks().forEach(t => t.stop());
          }
          if (displayStreamRef.current) {
            displayStreamRef.current.getTracks().forEach(t => t.stop());
          }
        });
        
        if (socket && roomId) {
          socket.emit('requestStopRecord', roomId);
        }
      }
    };
  }, [isRecording, socket, roomId]);

  return {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    startRecording,
    stopRecording,
  };
};