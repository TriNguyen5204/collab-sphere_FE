import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Copy, LogIn } from 'lucide-react';
import { useMediaStream } from './hooks/useMediaStream'; // ✅ Import hook

function JoinPage() {
  const myName = useSelector((state) => state.user.fullName);
  const [groupId, setGroupId] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const navigate = useNavigate();

  const { stream, toggleAudio, toggleVideo } = useMediaStream();
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleToggleAudio = () => {
    const newState = toggleAudio();
    setAudioEnabled(newState);
  };

  const handleToggleVideo = () => {
    const newState = toggleVideo();
    setVideoEnabled(newState);
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);
    navigate(`/room/${newRoomId}`, {
      state: { myName, audioEnabled, videoEnabled },
    });
  };

  const joinRoom = () => {
    if (groupId) {
      navigate(`/room/${groupId}`, {
        state: { myName, audioEnabled, videoEnabled },
      });
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
      {/* 🎥 Video preview */}
      <div className="bg-black relative rounded-2xl shadow-xl overflow-hidden w-full md:w-1/2 aspect-video">
        {videoEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">
            Camera Off
          </div>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={handleToggleAudio}
            className={`p-3 rounded-full ${
              audioEnabled ? 'bg-gray-800' : 'bg-red-600'
            } text-white hover:opacity-80`}
          >
            {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full ${
              videoEnabled ? 'bg-gray-800' : 'bg-red-600'
            } text-white hover:opacity-80`}
          >
            {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
        </div>
      </div>

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
