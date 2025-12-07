import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getLecturerClasses, getClassTeams } from '../../services/classApi';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const LecturerMeetings = () => {
  const navigate = useNavigate();
  const { userId } = useSelector(state => state.user);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  const [classTeams, setClassTeams] = useState({});
  const [loadingTeams, setLoadingTeams] = useState({});

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
    navigate(`/meeting/schedule/${teamId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          Meeting Management
        </h1>
        <p className="text-slate-500 mt-2">
          Select a class and team to schedule or manage meetings.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CalendarDaysIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No Classes Found</h3>
          <p className="text-slate-500">You don't have any active classes yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <div 
              key={cls.classId || cls.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => handleExpandClass(cls.classId || cls.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {cls.subjectCode ? cls.subjectCode.substring(0, 2) : 'CL'}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">
                      {cls.className || cls.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {cls.subjectCode} • {cls.semesterName || 'Current Semester'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    {cls.studentCount || cls.memberCount || 0} Students
                  </span>
                  {expandedClass === (cls.classId || cls.id) ? (
                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedClass === (cls.classId || cls.id) && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  {loadingTeams[cls.classId || cls.id] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : !classTeams[cls.classId || cls.id]?.length ? (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      No teams found in this class.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {classTeams[cls.classId || cls.id].map((team) => (
                        <button
                          key={team.teamId || team.id}
                          onClick={() => handleNavigateToMeeting(team.teamId || team.id)}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                        >
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <VideoCameraIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate group-hover:text-blue-600">
                              {team.teamName || team.name || `Team ${team.teamId}`}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {team.projectTitle || 'No Project'}
                            </p>
                          </div>
                          <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
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
    </div>
  );
};

export default LecturerMeetings;
