import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getLecturerClasses, getClassTeams } from '../../services/classApi';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  VideoCameraIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MeetingTypeList from '../../features/meeting/components/MeetingTypeList';
import { setMeetingTeamId, getMeetingTeamId, clearMeetingTeamId } from '../../utils/meetingSessionHelper';

const LecturerMeetings = () => {
  const navigate = useNavigate();
  const { userId } = useSelector(state => state.user);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  const [classTeams, setClassTeams] = useState({});
  const [loadingTeams, setLoadingTeams] = useState({});
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Check if there's a teamId in sessionStorage on mount
  useEffect(() => {
    const storedTeamId = getMeetingTeamId();
    console.log('LecturerMeetings - storedTeamId from sessionStorage:', storedTeamId);
    if (storedTeamId) {
      setSelectedTeamId(storedTeamId);
      console.log('LecturerMeetings - selectedTeamId set to:', storedTeamId);
    }
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await getLecturerClasses(userId);
        // Handle different response structures based on API
        const classList = response.data || response.list || response || [];
        setClasses(Array.isArray(classList) ? classList : []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchClasses();
    }
  }, [userId]);

  const handleExpandClass = async (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
      return;
    }

    setExpandedClass(classId);

    if (!classTeams[classId]) {
      try {
        setLoadingTeams(prev => ({ ...prev, [classId]: true }));
        const response = await getClassTeams(classId);
        const teamList = response.data || response.list || response || [];
        setClassTeams(prev => ({ ...prev, [classId]: teamList }));
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoadingTeams(prev => ({ ...prev, [classId]: false }));
      }
    }
  };

  const handleNavigateToMeeting = (teamId) => {
    setMeetingTeamId(teamId);
    setSelectedTeamId(teamId);
  };

  const handleBackToSelection = () => {
    clearMeetingTeamId();
    setSelectedTeamId(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {selectedTeamId ? (
          <div>
            <button 
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-slate-500 hover:text-orangeFpt-600 mb-6 transition-colors font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Team Selection
            </button>
            <MeetingTypeList teamId={selectedTeamId} />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-orangeFpt-50 rounded-xl text-orangeFpt-500">
                  <CalendarDaysIcon className="w-8 h-8" />
                </div>
                Meeting Management
              </h1>
              <p className="text-slate-500 mt-3 text-lg">
                Select a class and team to schedule or manage meetings.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orangeFpt-500"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-16 bg-[#FDFBF9] rounded-[2rem] border border-[#F3EFEA]">
                <CalendarDaysIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No Classes Found</h3>
                <p className="text-slate-500 mt-2">You don't have any active classes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div 
                    key={cls.classId || cls.id} 
                    className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(234,121,45,0.1)] hover:border-orangeFpt-100"
                  >
                    <button
                      onClick={() => handleExpandClass(cls.classId || cls.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-[#FDFBF9] transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-orangeFpt-50 flex items-center justify-center text-orangeFpt-600 font-bold text-lg">
                          {cls.subjectCode ? cls.subjectCode.substring(0, 2) : 'CL'}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-slate-800">
                            {cls.className || cls.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 mt-1">
                            {cls.subjectCode} • {cls.semesterName || 'Current Semester'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-slate-50 text-xs font-semibold text-slate-500 flex items-center gap-1.5 border border-slate-100">
                          <UserGroupIcon className="w-4 h-4" />
                          {cls.studentCount || cls.memberCount || 0} Students
                        </span>
                        <div className={`p-2 rounded-full transition-all duration-300 ${expandedClass === (cls.classId || cls.id) ? 'bg-orangeFpt-50 text-orangeFpt-500 rotate-180' : 'text-slate-400'}`}>
                          <ChevronDownIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {expandedClass === (cls.classId || cls.id) && (
                      <div className="border-t border-slate-50 bg-[#FDFBF9] p-6 animate-in slide-in-from-top-2 duration-200">
                        {loadingTeams[cls.classId || cls.id] ? (
                          <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orangeFpt-500"></div>
                          </div>
                        ) : !classTeams[cls.classId || cls.id]?.length ? (
                          <div className="text-center py-6 text-slate-400 text-sm font-medium italic">
                            No teams found in this class.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classTeams[cls.classId || cls.id].map((team) => (
                              <button
                                key={team.teamId || team.id}
                                onClick={() => handleNavigateToMeeting(team.teamId || team.id)}
                                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-orangeFpt-200 hover:shadow-md transition-all text-left group"
                              >
                                <div className="h-10 w-10 rounded-xl bg-orangeFpt-50 flex items-center justify-center text-orangeFpt-500 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                  {team.avatar || team.avatarImg ? (
                                    <img
                                      src={team.avatar || team.avatarImg}
                                      alt={team.teamName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <UserGroupIcon className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 truncate group-hover:text-orangeFpt-600 transition-colors">
                                    {team.teamName || team.name || `Team ${team.teamId}`}
                                  </p>
                                  <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                                    {team.projectName || team.projectInfo?.projectName || 'No Project'}
                                  </p>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-orangeFpt-400 group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerMeetings;
