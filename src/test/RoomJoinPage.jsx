import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { createMeeting } from "../services/meetingApi";
import { toast } from "sonner";

function JoinPage() {
  const myName = useSelector((state) => state.user.fullName);
  const [groupId, setGroupId] = useState("");
  const [myRoomId, setMyRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // 🔧 Hàm điều hướng
  const cleanupAndNavigate = (path, navState) => {
    setTimeout(() => {
      navigate(path, {
        state: {
          ...navState,
          audioEnabled: true,
          videoEnabled: true,
        },
      });
    }, 100);
  };

  // 🆕 Hàm tạo meeting + room
  const createRoom = async () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);

    const payload = {
      teamId: 2,
      title,
      description,
      meetingUrl: `http://localhost:5173/room/${newRoomId}`,
      scheduleTime: new Date().toISOString(),
    };

    try {
      const response = await createMeeting(payload);
      if (response) {
        toast.success("✅ Meeting created successfully!");
        cleanupAndNavigate(`/room/${newRoomId}`, { myName });
      }
    } catch (error) {
      console.error("❌ Failed to create meeting:", error);
      toast.error("Error creating meeting, please try again.");
    }
  };

  // 🟢 Join room có sẵn
  const joinRoom = () => {
    if (groupId.trim()) {
      cleanupAndNavigate(`/room/${groupId}`, { myName });
    } else {
      toast.error("Please enter a room ID");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row items-center justify-center p-6 gap-8">
      <div className="bg-white rounded-2xl shadow-lg w-full md:w-1/3 p-6 flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Ready to join or create a meeting?
        </h1>

        {/* Meeting Info Inputs */}
        <input
          type="text"
          placeholder="Meeting title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Meeting description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
        ></textarea>

        <button
          onClick={createRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Create New Room
        </button>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Join existing room */}
        <input
          type="text"
          placeholder="Enter Room ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
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
