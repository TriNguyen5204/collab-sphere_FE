import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getClassTeams, getClassById } from '../../../services/classApi';
import { getTeamDetail } from '../../../services/teamApi';
import { getTeamEvaluationSummary } from '../../../services/evaluationApi';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

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
      { label: 'Classes', href: '/lecturer/classes' },
      { label: 'Grading', href: '/lecturer/grading' },
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
        
        // Helper to safely extract nested properties
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />

          <header className={`${glassPanelClass} relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <LecturerBreadcrumbs items={breadcrumbItems} />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Class grading overview</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">{meta.className}</h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">{meta.subjectName}</span>
                  {meta.semesterName !== '—' && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{meta.semesterName}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/lecturer/grading')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
              >
                <ArrowLeftIcon className="h-4 w-4" /> Back to grading dashboard
              </button>
            </div>
          </header>

          <section className={`${glassPanelClass} rounded-3xl p-6`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Teams</p>
                <h2 className="text-2xl font-semibold text-slate-900">Evaluation status</h2>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.3em] text-slate-500">
                    <th className="py-2 pl-4">Team</th>
                    <th className="py-2">Project</th>
                    <th className="py-2">Members</th>
                    <th className="py-2">Final grade</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td className="py-6 text-center text-slate-500" colSpan={6}>
                        Loading teams…
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((team) => (
                      <tr key={team.teamId}>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-3">
                            {team.teamImage ? (
                              <img
                                src={team.teamImage}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold ring-2 ring-white shadow-sm">
                                {team.teamName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">{team.teamName}</div>
                              <div className="text-xs text-slate-500">{team.semesterName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          <span className="line-clamp-1 max-w-[250px]" title={team.projectName}>
                            {team.projectName}
                          </span>
                        </td>
                        <td className="py-3">{team.memberCount}</td>
                        <td className="py-3">{team.finalGrade ?? '—'}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              team.status === 'graded'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {team.status === 'graded' ? 'Graded' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleOpenTeam(team.teamId)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                          >
                            {team.status === 'graded' ? 'Review grade' : 'Grade now'}
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-slate-500" colSpan={6}>
                        No teams available for this class yet.
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
