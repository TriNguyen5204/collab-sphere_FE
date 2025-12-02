import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon, 
  FlagIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam } from '../../../services/milestoneApi';
import { toast } from 'sonner';

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusChip = (statusString) => {
  switch ((statusString || '').toUpperCase()) {
    case 'COMPLETED':
    case 'DONE':
      return { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'INPROGRESS':
    case 'IN_PROGRESS':
      return { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'LATE':
      return { label: 'Late', className: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: 'Pending', className: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
};

const TeamMilestonesPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState({ team: false, milestones: false });

  useEffect(() => {
    let ignore = false;
    if (!teamId) return () => { ignore = true; };

    const fetchTeam = async () => {
      setLoading((prev) => ({ ...prev, team: true }));
      try {
        const detail = await getTeamDetail(teamId);
        if (!ignore) setTeamInfo(detail);
      } catch (error) {
        console.error('Unable to load team detail.', error);
        if (!ignore) toast.error('Unable to load team detail.');
      } finally {
        if (!ignore) setLoading((prev) => ({ ...prev, team: false }));
      }
    };

    fetchTeam();
    return () => { ignore = true; };
  }, [teamId]);

  useEffect(() => {
    let ignore = false;
    if (!teamId) return () => { ignore = true; };

    const fetchMilestones = async () => {
      setLoading((prev) => ({ ...prev, milestones: true }));
      try {
        const response = await getMilestonesByTeam(teamId);
        let list = [];
        if (Array.isArray(response?.teamMilestones)) list = response.teamMilestones;
        else if (Array.isArray(response?.list)) list = response.list;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response)) list = response;
        
        if (!ignore) setMilestones(list);
      } catch (error) {
        console.error('Unable to load milestones for this team.', error);
        if (!ignore) {
          toast.error('Unable to load team milestones.');
          setMilestones([]);
        }
      } finally {
        if (!ignore) setLoading((prev) => ({ ...prev, milestones: false }));
      }
    };

    fetchMilestones();
    return () => { ignore = true; };
  }, [teamId]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Grading', href: `/lecturer/grading/${classId}` });
    }
    items.push({ label: teamInfo?.teamName ? `${teamInfo.teamName} milestones` : 'Team milestones' });
    return items;
  }, [classId, teamInfo?.teamName]);

  const handleBackToClassGrading = () => {
    if (classId) {
      navigate(`/lecturer/grading/${classId}`);
    } else {
      navigate('/lecturer/classes');
    }
  };

  const handleOpenMilestoneEvaluationWorkspace = () => {
    if (classId) {
      navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`);
    } else {
      navigate(`/lecturer/grading/team/${teamId}/milestones/evaluate`);
    }
  };

  const handleOpenMilestone = (milestoneId) => {
    if (!milestoneId) return;
    if (classId) {
      navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/${milestoneId}`);
    } else {
      navigate(`/lecturer/grading/team/${teamId}/milestones/${milestoneId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HERO HEADER --- */}
        <div className="mx-auto max-w-5xl">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Team Milestones
                   </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {teamInfo?.teamName ? `Team ${teamInfo.teamName}` : 'Loading Team...'}
                </h1>
                <p className="text-slate-600 text-base">
                  Review every milestone before drilling into submissions and grading.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToClassGrading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orangeFpt-600 transition-all shadow-sm active:scale-95"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOpenMilestoneEvaluationWorkspace}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orangeFpt-500 text-white text-sm font-semibold hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-200 active:scale-95"
                >
                  <BeakerIcon className="h-4 w-4" />
                  Evaluation Workspace
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- MILESTONE LIST --- */}
        <div className="mx-auto max-w-5xl mt-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                  <FlagIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Milestone List</h2>
                  <p className="text-xs text-slate-500">{milestones.length} milestones found</p>
                </div>
              </div>
            </div>

            {loading.milestones ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-50 animate-pulse border border-slate-100"></div>
                ))}
              </div>
            ) : milestones.length ? (
              <div className="space-y-4">
                {milestones.map((milestone) => {
                  const id = milestone.teamMilestoneId ?? milestone.milestoneId ?? milestone.id;
                  const status = getStatusChip(milestone.statusString);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleOpenMilestone(id)}
                      className="group w-full text-left flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-orangeFpt-200 hover:shadow-md hover:shadow-orangeFpt-500/5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-orangeFpt-600 transition-colors truncate">
                            {milestone.title || 'Untitled milestone'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 max-w-2xl">
                          {milestone.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                        <div className="flex flex-col items-start md:items-end gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orangeFpt-50 group-hover:text-orangeFpt-500 transition-colors">
                          <ChevronRightIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FlagIcon className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-900">No milestones found</h3>
                <p className="text-xs text-slate-500 mt-1">This team has not been assigned any milestones yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamMilestonesPage;
