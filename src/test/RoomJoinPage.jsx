import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Copy, LogIn } from 'lucide-react';

function JoinPage() {
  const myName = useSelector((state) => state.user.fullName);
  const [groupId, setGroupId] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Lấy camera + mic preview
  useEffect(() => {
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Cannot access camera or mic:', err);
      }
    };
    initMedia();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 🔹 Toggle video & audio
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setAudioEnabled(!audioEnabled);
    }
  };

  // 🔹 Create / Join room
  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);
    navigate(`/room/${newRoomId}`, { state: { myName } });
  };

  const joinRoom = () => {
    if (groupId) {
      navigate(`/room/${groupId}`, { state: { myName } });
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
      {/* 🔹 Video Preview */}
      <div className="bg-black relative rounded-2xl shadow-xl overflow-hidden w-full md:w-1/2 aspect-video">
        {videoEnabled ? (
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

        {/* Mic + Camera controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              audioEnabled ? 'bg-gray-800' : 'bg-red-600'
            } text-white hover:opacity-80`}
          >
            {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoEnabled ? 'bg-gray-800' : 'bg-red-600'
            } text-white hover:opacity-80`}
          >
            {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
        </div>
      </div>

      {/* 🔹 Info & Actions */}
      <div className="bg-white rounded-2xl shadow-lg w-full md:w-1/3 p-6 flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Ready to join the meeting?
        </h1>

        {myRoomId ? (
          <div className="text-center">
            <p className="text-gray-600 mb-2">Your Room ID: <b>{myRoomId}</b></p>
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

        <div className="flex flex-col gap-3">
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
    </div>
  );
}

export default JoinPage;
