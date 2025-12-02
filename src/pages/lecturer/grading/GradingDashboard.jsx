import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getLecturerClasses, getClassTeams } from '../../../services/classApi';
import { getTeamEvaluationSummary } from '../../../services/evaluationApi';

// --- Helpers ---

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
    loadOverview(lecturerId);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50">

        {/* --- HERO HEADER --- */}
        <LecturerBreadcrumbs items={breadcrumbItems} />

        <header className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Class Grading Overview</h1>
              <p className="mt-1 text-sm text-slate-600 mb-4">
                Monitor grading progress across all your classes and identify teams that need evaluation.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orangeFpt-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin text-orangeFpt-500' : ''}`} />
                Refresh Data
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-medium text-slate-500">Total Classes</span>
                <span className="text-2xl font-bold text-slate-900">{cards.length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- MAIN GRID --- */}
        <div className="mx-auto">
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading && !cards.length ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
                  <div className="h-4 w-24 rounded-lg bg-slate-100 mb-4" />
                  <div className="h-8 w-3/4 rounded-lg bg-slate-200 mb-2" />
                  <div className="h-4 w-1/2 rounded-lg bg-slate-100 mb-6" />
                  <div className="h-2 w-full rounded-full bg-slate-100 mb-3" />
                  <div className="h-4 w-1/3 rounded-lg bg-slate-100" />
                </div>
              ))
            ) : cards.length > 0 ? (
              cards.map((cls) => {
                const completion = cls.totalTeams ? Math.round((cls.gradedTeams / cls.totalTeams) * 100) : 0;
                const isComplete = cls.totalTeams > 0 && cls.gradedTeams === cls.totalTeams;

                return (
                  <button
                    key={cls.classId}
                    type="button"
                    onClick={() => handleOpenClass(cls.classId)}
                    className="group relative flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-orangeFpt-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 group-hover:bg-orangeFpt-50 group-hover:text-orangeFpt-700 transition-colors w-fit">
                          {cls.subjectCode}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-orangeFpt-600 transition-colors line-clamp-1" title={cls.className}>
                          {cls.className}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{cls.subjectName}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-orangeFpt-50 group-hover:text-orangeFpt-500 transition-colors">
                        <ClipboardDocumentListIcon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grading Progress</p>
                        <span className={`text-sm font-bold ${isComplete ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {completion}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-orangeFpt-500'
                            }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                          <ChartBarIcon className="h-4 w-4 text-slate-400" />
                          <span>{cls.gradedTeams} / {cls.totalTeams} Teams</span>
                        </div>
                        {isComplete && (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Done
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                <AcademicCapIcon className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No Active Classes</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">
                  You don't have any classes assigned for grading yet. Once you are linked to a class, it will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GradingDashboard;
