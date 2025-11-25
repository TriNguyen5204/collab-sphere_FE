import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipboardDocumentListIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getLecturerClasses, getClassTeams } from '../../../services/classApi';
import { getTeamEvaluationSummary } from '../../../services/evaluationApi';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const extractClassCollection = (payload) => {
  if (Array.isArray(payload?.classes)) return payload.classes;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const extractTeamCollection = (payload) => {
  if (Array.isArray(payload?.teams)) return payload.teams;
  if (Array.isArray(payload?.teamList)) return payload.teamList;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const mapClassRecord = (record) => ({
  classId: record?.classId ?? record?.id ?? record?.class_id ?? null,
  className: record?.className ?? record?.name ?? 'Class',
  subjectName: record?.subjectName ?? record?.subject?.subjectName ?? record?.subject?.name ?? '—',
  subjectCode: record?.subjectCode ?? record?.subject?.subjectCode ?? record?.subject?.code ?? '—',
});

const createTeamRecord = (record) => ({
  teamId: record?.teamId ?? record?.id ?? record?.team_id ?? null,
});

const GradingDashboard = () => {
  const lecturerId = useSelector((state) => state.user?.userId);
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef(false);
  const requestIdRef = useRef(0);

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: 'Grading overview' },
  ], []);

  const loadOverview = async (activeLecturerId = lecturerId) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const response = await getLecturerClasses(activeLecturerId);
      const normalizedClasses = extractClassCollection(response)
        .map(mapClassRecord)
        .filter((cls) => cls.classId);

      const enriched = await Promise.all(
        normalizedClasses.map(async (cls) => {
          try {
            const teamsResponse = await getClassTeams(cls.classId);
            const teams = extractTeamCollection(teamsResponse)
              .map(createTeamRecord)
              .filter((team) => team.teamId);

            if (!teams.length) {
              return { ...cls, totalTeams: 0, gradedTeams: 0 };
            }

            const evaluationSnapshots = await Promise.all(
              teams.map(async (team) => {
                try {
                  const evaluation = await getTeamEvaluationSummary(team.teamId);
                  return Boolean(evaluation);
                } catch (error) {
                  if (error?.response?.status === 404) {
                    return false;
                  }
                  console.error('Unable to load evaluation summary for team', team.teamId, error);
                  return false;
                }
              })
            );

            const gradedTeams = evaluationSnapshots.filter(Boolean).length;
            return { ...cls, totalTeams: teams.length, gradedTeams };
          } catch (error) {
            console.error('Unable to load team data for class', cls.classId, error);
            return { ...cls, totalTeams: 0, gradedTeams: 0 };
          }
        })
      );

      if (!cancelRef.current && requestIdRef.current === requestId) {
        setCards(enriched);
      }
    } catch (error) {
      console.error('Unable to load classes for grading overview.', error);
      if (!cancelRef.current && requestIdRef.current === requestId) {
        toast.error('Unable to load grading overview for your classes.');
      }
    } finally {
      if (!cancelRef.current && requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!lecturerId) {
      setCards([]);
      return () => {
        cancelRef.current = true;
      };
    }

    cancelRef.current = false;
    loadOverview(lecturerId);

    return () => {
      cancelRef.current = true;
    };
  }, [lecturerId]);

  const handleOpenClass = (classId) => {
    if (!classId) return;
    navigate(`/lecturer/grading/${classId}`);
  };

  const handleRefresh = () => {
    if (!lecturerId) return;
    if (!lecturerId) return;
    loadOverview(lecturerId);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />

          <header className={`${glassPanelClass} relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
            <div className="space-y-4">
              <LecturerBreadcrumbs items={breadcrumbItems} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace · Grading</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Class grading overview</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Review every class you teach, monitor grading progress, and drill down into teams that still need attention.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh data
              </button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading && !cards.length ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className={`${glassPanelClass} animate-pulse rounded-3xl p-6`}>
                  <div className="h-5 w-1/2 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-6 h-3 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                </div>
              ))
            ) : cards.length ? (
              cards.map((cls) => {
                const completion = cls.totalTeams ? Math.round((cls.gradedTeams / cls.totalTeams) * 100) : 0;
                return (
                  <button
                    key={cls.classId}
                    type="button"
                    onClick={() => handleOpenClass(cls.classId)}
                    className={`${glassPanelClass} flex flex-col gap-4 rounded-3xl p-6 text-left transition hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{cls.subjectCode}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">{cls.className}</h3>
                        <p className="text-sm text-slate-600">{cls.subjectName}</p>
                      </div>
                      <span className="rounded-2xl bg-white/70 p-3 text-slate-500">
                        <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Grading progress</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {cls.gradedTeams}/{cls.totalTeams} teams graded
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={`${glassPanelClass} rounded-3xl p-6 text-sm text-slate-600`}>
                No classes found. Assignments appear here once you are linked to a class.
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GradingDashboard;
