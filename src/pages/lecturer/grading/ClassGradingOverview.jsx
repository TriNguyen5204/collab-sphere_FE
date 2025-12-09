import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getClassTeams, getClassById } from '../../../services/classApi';
import { getTeamDetail } from '../../../services/teamApi';
import { getTeamEvaluationSummary } from '../../../services/evaluationApi';

const extractTeamCollection = (payload) => {
  if (Array.isArray(payload?.teams)) return payload.teams;
  if (Array.isArray(payload?.teamList)) return payload.teamList;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const mapTeamRecord = (record) => ({
  teamId: record?.teamId ?? record?.id ?? record?.team_id ?? null,
  teamName: record?.teamName ?? record?.name ?? 'Team',
  projectName: record?.projectName ?? '—',
  teamImage: record?.teamImage ?? null,
  semesterName: record?.semesterName ?? '—',
  progress: record?.progress ?? null,
});

const deriveClassMeta = (payload, fallbackId) => ({
  className: payload?.className ?? payload?.classInfo?.className ?? payload?.classDetail?.className ?? `Class ${fallbackId}`,
  subjectName: payload?.subjectName ?? payload?.classInfo?.subjectName ?? payload?.classDetail?.subjectName ?? '—',
});

const ClassGradingOverview = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ className: `Class ${classId}`, subjectName: '—', semesterName: '—' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Grading overview', href: '/lecturer/grading' },
      { label: meta.className || `Class ${classId}` },
    ],
    [classId, meta.className]
  );

  useEffect(() => {
    let ignore = false;
    if (!classId) return () => {
      ignore = true;
    };

    const loadTeams = async () => {
      setLoading(true);
      try {
        const [teamsResponse, classDetails] = await Promise.all([
          getClassTeams(classId),
          getClassById(classId).catch((err) => {
            console.warn('Failed to fetch class details', err);
            return null;
          }),
        ]);

        const teamList = extractTeamCollection(teamsResponse).map(mapTeamRecord).filter((team) => team.teamId);
        
        const derivedMeta = deriveClassMeta(teamsResponse, classId);
        
        const getSemesterName = (details) => {
          return details?.semesterName 
            ?? details?.semester?.semesterName 
            ?? details?.semester?.name 
            ?? details?.semester_name 
            ?? '—';
        };

        const getSubjectName = (details, fallback) => {
          return details?.subjectName 
            ?? details?.subject?.subjectName 
            ?? details?.subject?.name 
            ?? details?.subject_name 
            ?? fallback;
        };

        setMeta({
          className: classDetails?.className ?? classDetails?.classCode ?? derivedMeta.className,
          subjectName: getSubjectName(classDetails, derivedMeta.subjectName),
          semesterName: getSemesterName(classDetails),
        });

        const enriched = await Promise.all(
          teamList.map(async (team) => {
            try {
              const [detail, evaluation] = await Promise.all([
                getTeamDetail(team.teamId).catch(() => null),
                getTeamEvaluationSummary(team.teamId).catch(() => null),
              ]);

              const memberCount = (() => {
                if (detail?.memberInfo?.memberCount !== undefined && detail?.memberInfo?.memberCount !== null) {
                  return detail.memberInfo.memberCount;
                }
                if (Array.isArray(detail?.memberInfo?.members)) {
                  return detail.memberInfo.members.length;
                }
                return 0;
              })();

              return {
                teamId: team.teamId,
                teamName: team.teamName,
                projectName: team.projectName,
                teamImage: team.teamImage,
                semesterName: team.semesterName,
                progress: team.progress,
                memberCount,
                finalGrade: evaluation?.finalGrade ?? null,
                status: evaluation ? 'graded' : 'pending',
              };
            } catch (error) {
              console.error('Unable to load grading data for team', team.teamId, error);
              return {
                teamId: team.teamId,
                teamName: team.teamName,
                projectName: team.projectName,
                teamImage: team.teamImage,
                semesterName: team.semesterName,
                progress: team.progress,
                memberCount: 0,
                finalGrade: null,
                status: 'pending',
              };
            }
          })
        );

        if (!ignore) {
          setRows(enriched);
        }
      } catch (error) {
        console.error('Unable to load class grading data.', error);
        toast.error('Unable to load teams for this class.');
        if (!ignore) {
          setRows([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      ignore = true;
    };
  }, [classId]);

  const handleOpenTeam = (teamId) => {
    if (!teamId) return;
    navigate(`/lecturer/grading/class/${classId}/team/${teamId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50">
        
        {/* --- HERO HEADER --- */}
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Class Grading
                   </span>
                </div>
                <div>
                   <h1 className="text-3xl font-bold text-slate-900">{meta.className}</h1>
                   <div className="mt-2 flex items-center gap-3 text-lg text-slate-600">
                      <span className="font-medium">{meta.subjectName}</span>
                      {meta.semesterName !== '—' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span>{meta.semesterName}</span>
                        </>
                      )}
                   </div>
                </div>
              </div>
            </div>
        </div>

        {/* --- TEAM LIST --- */}
        <div className="mx-auto">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                   <UserGroupIcon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Student Teams</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                 {rows.length} Teams
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Team</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3 text-center">Members</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td className="py-8 text-center text-slate-500" colSpan={6}>
                        <div className="flex justify-center items-center gap-2">
                           <div className="h-2 w-2 bg-orangeFpt-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="h-2 w-2 bg-orangeFpt-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="h-2 w-2 bg-orangeFpt-400 rounded-full animate-bounce"></div>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((team) => (
                      <tr key={team.teamId} className="group hover:bg-orangeFpt-50/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {team.teamImage ? (
                              <img
                                src={team.teamImage}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-600 font-bold ring-2 ring-white shadow-sm">
                                {team.teamName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-orangeFpt-700 transition-colors">{team.teamName}</div>
                              <div className="text-xs text-slate-500">{team.semesterName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="line-clamp-1 max-w-[250px] font-medium text-slate-700" title={team.projectName}>
                            {team.projectName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-medium">{team.memberCount}</td>
                        <td className="px-4 py-4 text-center font-bold text-slate-900">{team.finalGrade ?? '—'}</td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                              team.status === 'graded'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {team.status === 'graded' ? 'Graded' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenTeam(team.teamId)}
                            className="inline-flex items-center gap-1 text-sm font-bold text-orangeFpt-600 hover:text-orangeFpt-700 hover:underline decoration-2 underline-offset-4 transition-all"
                          >
                            {team.status === 'graded' ? 'Review Grade' : 'Grade Now'}
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-12 text-center text-slate-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-2">
                           <UserGroupIcon className="h-8 w-8 text-slate-300" />
                           <p>No teams available for grading in this class yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassGradingOverview;
