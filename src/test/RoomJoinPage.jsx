import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Copy, LogIn } from 'lucide-react';
import { useMediaStream } from './hooks/useMediaStream';

function JoinPage() {
  const myName = useSelector((state) => state.user.fullName);
  const [groupId, setGroupId] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const navigate = useNavigate();

  const { stream, localStreamRef } = useMediaStream();
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);


  // 🆕 Sync state với stream thực tế
  useEffect(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
    }
  }, [stream, localStreamRef]);

  // 🔧 Helper function để cleanup stream trước khi navigate
  const cleanupAndNavigate = (path, navState) => {
    // Lưu state hiện tại trước khi cleanup
    const currentAudioState = audioEnabled;
    const currentVideoState = videoEnabled;

    // Dừng tất cả tracks trước khi navigate
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      localStreamRef.current = null;
    }

    // Navigate với state đã lưu (không phải Promise)
    setTimeout(() => {
      navigate(path, { 
        state: {
          ...navState,
          audioEnabled: currentAudioState,
          videoEnabled: currentVideoState
        }
      });
    }, 100);
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);
    cleanupAndNavigate(`/room/${newRoomId}`, { myName });
  };

  const joinRoom = () => {
    if (groupId) {
      cleanupAndNavigate(`/room/${groupId}`, { myName });
    } else {
      alert('Please enter a room ID');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center p-6 gap-8">
      {/* 📋 Info */}
      <div className="bg-white rounded-2xl shadow-lg w-full md:w-1/3 p-6 flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Ready to join the meeting?
        </h1>

        {myRoomId ? (
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your Room ID: <b>{myRoomId}</b>
            </p>
            <button
              onClick={() => copyToClipboard(myRoomId)}
              className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
            >
              <Copy size={18} /> Copy Room ID
            </button>
          </div>
        ) : (
          <button
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Create New Room
          </button>
        )}

        <input
          type="text"
          placeholder="Enter Room ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={joinRoom}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          <LogIn size={18} /> Join Room
        </button>
      </div>
    </div>
  );
}

export default JoinPage;