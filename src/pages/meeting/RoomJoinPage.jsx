import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogIn, Plus, Users, Clock, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { createMeeting } from '../../features/meeting/services/meetingApi';
import { toast } from 'sonner';
import ClipLoader from 'react-spinners/ClipLoader';
import { getMeetingTeamId } from '../../utils/meetingSessionHelper';

function JoinPage() {
  // Get authenticated user data from Redux store (secure source)
  const userId = useSelector(state => state.user.userId);
  const myName = useSelector(state => state.user.fullName);
  const roleName = useSelector(state => state.user.roleName);
  const accessToken = useSelector(state => state.user.accessToken);
  
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const teamId = getMeetingTeamId();
  console.log('RoomJoinPage - teamId from sessionStorage:', teamId);

  // Redirect if no teamId found in sessionStorage
  useEffect(() => {
    if (!teamId) {
      toast.error('No team selected. Please select a team first.');
      navigate('/lecturer/meetings');
    }
  }, [teamId, navigate]);

  // Navigation function - pass user data securely
  const cleanupAndNavigate = (path, navState) => {
    setTimeout(() => {
      navigate(path, {
        state: {
          ...navState,
          // Always use authenticated user name from Redux
          myName: myName,
        },
      });
    }, 100);
  };

  // Create meeting + room
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
      description: '',
      meetingUrl: `https://collabsphere.space/room/${newRoomId}`,
      scheduleTime: new Date(now.getTime() + vnOffsetMs).toISOString(),
    };

    try {
      const response = await createMeeting(payload);
      if (response) {
        toast.success('Meeting created successfully!');
        // Match "MeetingID: 123" (new format) or "ID: 123" (old format)
        const idMatch = response.message.match(/MeetingID:\s*(\d+)/) || response.message.match(/ID:\s*(\d+)/);
        const meetingId = idMatch ? parseInt(idMatch[1], 10) : null;

        // Match "TeamID: 123"
        const teamIdMatch = response.message.match(/TeamID:\s*(\d+)/);
        const extractedTeamId = teamIdMatch ? parseInt(teamIdMatch[1], 10) : teamId;
        
        console.log('[RoomJoinPage] Created meeting with ID:', meetingId);
        console.log('[RoomJoinPage] Extracted TeamID:', extractedTeamId);

        cleanupAndNavigate(`/room/${newRoomId}`, {
          title,
          description: '',
          meetingId,
          isHost: true,
          teamId: extractedTeamId, // Pass extractedTeamId via state instead of URL
        });
      }
    } catch (error) {
      console.log(error)
      toast.error('Error creating meeting, please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join existing room
  const joinRoom = () => {
    if (groupId.trim()) {
      cleanupAndNavigate(`/room/${groupId}`, { 
        isHost: false,
        teamId: teamId, // Pass teamId via state instead of URL
      });
    } else {
      toast.error('Please enter a room ID');
    }
  };

  const handleBack = () => {
    if (roleName === 'LECTURER') {
      navigate('/lecturer/meetings');
    } else if (roleName === 'STUDENT') {
      navigate('/meeting');
    } else {
      navigate('/');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center p-6 relative overflow-hidden'>
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />

      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Hub
      </button>

      <div className='w-full max-w-6xl relative z-10'>
        {/* Main Content - Two Glass Panels */}
        <div className='grid md:grid-cols-2 gap-12'>
          
          {/* Create New Meeting Panel (Warm/Orange) */}
          <div className='group relative h-full'>
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.15)] group-hover:border-orange-200/50" />
            
            <div className="relative p-12 h-full flex flex-col">
              {/* 3D Icon Container */}
              <div className='mb-10'>
                <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-300 to-orange-600 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_12px_24px_rgba(249,115,22,0.3)] flex items-center justify-center'>
                  <Plus className='w-10 h-10 text-white drop-shadow-md' />
                </div>
              </div>

              <h2 className='text-3xl font-bold text-slate-800 mb-2'>Create Meeting</h2>
              <p className="text-slate-500 mb-8">Start a new session instantly.</p>

              <div className='flex-1 flex flex-col space-y-6'>
                <div>
                  <label className='block text-sm font-semibold text-slate-600 mb-3 ml-1 uppercase tracking-wider'>
                    Meeting Title
                  </label>
                  <input
                    type='text'
                    placeholder='e.g., Team Standup'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className='w-full px-6 py-5 rounded-2xl bg-white/50 border border-white/60 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-100/50 focus:outline-none transition-all text-slate-800 placeholder:text-slate-400 backdrop-blur-sm shadow-inner'
                  />
                </div>

                <button
                  onClick={createRoom}
                  className='w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-5 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-3 group/btn mt-4'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ClipLoader size={20} color='white' />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">Create New Meeting</span>
                      <Plus className='w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300' />
                    </>
                  )}
                </button>

                <div className='mt-auto pt-4'>
                  <div className='flex items-center gap-3 text-sm text-slate-500 bg-white/30 px-5 py-4 rounded-2xl border border-white/40 backdrop-blur-md'>
                    <Clock className='w-4 h-4 text-orange-500' />
                    <span>Ready to launch instantly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Meeting Panel (Cool/Blue) */}
          <div className='group relative h-full'>
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] group-hover:border-blue-200/50" />
            
            <div className="relative p-12 h-full flex flex-col">
              {/* 3D Icon Container */}
              <div className='mb-10'>
                <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_12px_24px_rgba(59,130,246,0.3)] flex items-center justify-center'>
                  <Users className='w-10 h-10 text-white drop-shadow-md' />
                </div>
              </div>

              <h2 className='text-3xl font-bold text-slate-800 mb-2'>Join Meeting</h2>
              <p className="text-slate-500 mb-8">Connect with your team via code.</p>

              <div className='flex-1 flex flex-col space-y-6'>
                <div>
                  <label className='block text-sm font-semibold text-slate-600 mb-3 ml-1 uppercase tracking-wider'>
                    Room ID
                  </label>
                  <input
                    type='text'
                    placeholder='Enter meeting code'
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className='w-full px-6 py-5 rounded-2xl bg-white/50 border border-white/60 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-100/50 focus:outline-none transition-all text-lg tracking-wider font-mono text-slate-800 placeholder:text-slate-400 backdrop-blur-sm shadow-inner'
                  />
                </div>

                <button
                  onClick={joinRoom}
                  className='w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn mt-4'
                >
                  <span className="text-lg">Join Meeting</span>
                  <LogIn className='w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300' />
                </button>
                
                <div className='mt-auto pt-4'>
                  <div className='flex items-center gap-3 text-sm text-slate-500 px-2'>
                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse"></div>
                    <span>Secure connection established</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className='mt-16 text-center'>
          <p className='text-sm text-slate-400 font-medium tracking-wide uppercase opacity-60'>
            End-to-end encrypted • Secure • Private
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
