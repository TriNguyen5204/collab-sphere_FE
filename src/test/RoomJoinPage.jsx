import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { LogIn, Video, Plus, Users, Clock } from 'lucide-react';
import { createMeeting } from '../services/meetingApi';
import { toast } from 'sonner';
import ClipLoader from 'react-spinners/ClipLoader';

function JoinPage() {
  const myName = useSelector(state => state.user.fullName);
  const {teamId} = useParams();
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔧 Hàm điều hướng
  const cleanupAndNavigate = (path, navState) => {
    setTimeout(() => {
      navigate(path, {
        state: {
          ...navState,
        },
      });
    }, 100);
  };

  // 🆕 Hàm tạo meeting + room
  const createRoom = async () => {
    if (!title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    setLoading(true);
    const newRoomId = Math.random().toString(36).substring(2, 10);

    const now = new Date();
    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const payload = {
      teamId: teamId,
      title,
      description,
      meetingUrl: `${import.meta.env.VITE_FRONTEND_URL}/room/${newRoomId}`,
      scheduleTime: new Date(now.getTime() + vnOffsetMs).toISOString(),
    };

    try {
      const response = await createMeeting(payload);
      if (response) {
        toast.success('✅ Meeting created successfully!');
        const idMatch = response.message.match(/ID:\s*(\d+)/);
        const meetingId = idMatch ? parseInt(idMatch[1], 10) : null;
        cleanupAndNavigate(`/room/${newRoomId}`, {
          myName,
          title,
          description,
          meetingId,
          isHost: true,
        });
      }
    } catch (error) {
      console.error('❌ Failed to create meeting:', error);
      toast.error('Error creating meeting, please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Join room có sẵn
  const joinRoom = () => {
    if (groupId.trim()) {
      cleanupAndNavigate(`/room/${groupId}`, { myName, isHost: false });
    } else {
      toast.error('Please enter a room ID');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-5xl'>
        {/* Header Section */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg'>
            <Video className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Welcome back, {myName || 'Guest'}
          </h1>
          <p className='text-gray-600 text-lg'>
            Start a new meeting or join an existing one
          </p>
        </div>

        {/* Main Content - Two Cards Side by Side */}
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Create New Meeting Card */}
          <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Plus className='w-6 h-6 text-blue-600' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Create Meeting
              </h2>
            </div>

            <div className='space-y-4'>
              {/* Title Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Meeting Title *
                </label>
                <input
                  type='text'
                  placeholder='e.g., Team Standup'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white'
                />
              </div>

              {/* Description Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description (Optional)
                </label>
                <textarea
                  placeholder='Add meeting details...'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none bg-gray-50 focus:bg-white'
                  rows='4'
                ></textarea>
              </div>

              {/* Create Button */}
              <button
                onClick={createRoom}
                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color='white' />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Plus className='w-5 h-5 group-hover:rotate-90 transition-transform duration-200' />
                    <span>Create New Meeting</span>
                  </>
                )}
              </button>

              {/* Info Badge */}
              <div className='flex items-center gap-2 text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg'>
                <Clock className='w-4 h-4' />
                <span>Meeting starts instantly</span>
              </div>
            </div>
          </div>

          {/* Join Existing Meeting Card */}
          <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <Users className='w-6 h-6 text-green-600' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Join Meeting</h2>
            </div>

            <div className='space-y-4'>
              {/* Room ID Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Room ID *
                </label>
                <input
                  type='text'
                  placeholder='Enter meeting code'
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white text-lg tracking-wider font-mono'
                />
              </div>

              {/* Join Button */}
              <button
                onClick={joinRoom}
                className='w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group'
              >
                <LogIn className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-200' />
                Join Meeting
              </button>

              {/* Spacer to align with create card */}
              <div className='h-24'></div>

              {/* Info Badge */}
              <div className='flex items-center gap-2 text-sm text-gray-500 bg-green-50 px-4 py-2 rounded-lg'>
                <Users className='w-4 h-4' />
                <span>Connect with your team instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-500'>
            Your meetings are secure and private • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
