import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import { AcademicCapIcon, ClipboardDocumentListIcon, Squares2X2Icon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getLecturerClasses } from '../../services/classApi';

const REQUIRED_CLASS_FIELDS = {
  classId: 'Used as the unique key for cards and navigation into class detail.',
  className: 'Displayed as the card title so lecturers can identify the class.',
  subjectCode: 'Shown as the subject badge and used for filtering.',
  subjectName: 'Supports search and gives readable context beside the code.',
  memberCount: 'Feeds the student count metrics in the stat tiles and class cards.',
  teamCount: 'Required to surface how many teams exist for each class.',
  lecturerName: 'Clarifies the class owner when multiple lecturers collaborate.',
  createdDate: 'Supports chronological sorting and potential timeline displays.',
  isActive: 'Determines status badges and powers the active/inactive filter.'
};

const mapApiClassToViewModel = (apiClass = {}) => ({
  classId: apiClass.classId ?? apiClass.id ?? null,
  className: apiClass.className ?? apiClass.name ?? 'Untitled class',
  subjectCode: apiClass.subjectCode ?? apiClass.subject?.code ?? '—',
  subjectName: apiClass.subjectName ?? apiClass.subject?.name ?? '—',
  semesterName: apiClass.semesterName ?? apiClass.semester?.name ?? '—',
  memberCount:
    apiClass.memberCount ??
    apiClass.studentCount ??
    apiClass.numberOfStudents ??
    apiClass.totalStudents ??
    0,
  teamCount:
    apiClass.teamCount ??
    apiClass.numberOfTeams ??
    apiClass.totalTeams ??
    0,
  lecturerName:
    apiClass.lecturerName ??
    apiClass.lecturerFullName ??
    apiClass.lecturer?.fullName ??
    '—',
  createdDate: apiClass.createdDate ?? apiClass.createdAt ?? null,
  isActive: (() => {
    if (typeof apiClass.isActive === 'boolean') {
      return apiClass.isActive;
    }

    const statusValue = apiClass.status ?? apiClass.classStatus ?? apiClass.state;

    if (typeof statusValue === 'number') {
      return statusValue === 1 || statusValue === 2;
    }

    if (typeof statusValue === 'string') {
      const normalized = statusValue.toLowerCase();
      return ['active', 'in-delivery', 'in_delivery', 'in progress', 'in_progress'].includes(normalized);
    }

    return false;
  })()
});

const extractClassList = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.list)) {
    return payload.list;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const normaliseClassResponse = (payload) => {
  const rawClasses = extractClassList(payload);
  const missingFields = new Set();

  const normalisedClasses = rawClasses.map((rawClass) => {
    Object.keys(REQUIRED_CLASS_FIELDS).forEach((field) => {
      const value = rawClass?.[field];
      if (value === undefined || value === null) {
        missingFields.add(field);
      }
    });
    return mapApiClassToViewModel(rawClass);
  });

  return {
    classes: normalisedClasses,
    missingFields: Array.from(missingFields)
  };
};

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const renderClassStatSkeleton = (key) => (
  <div key={key} className={`${glassPanelClass} rounded-2xl p-4 animate-pulse`}>
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-2.5 w-24 rounded bg-slate-200" />
        <div className="h-7 w-16 rounded bg-slate-300" />
      </div>
      <div className="h-11 w-11 rounded-2xl bg-slate-100" />
    </div>
    <div className="mt-4 h-2.5 w-32 rounded bg-slate-200" />
  </div>
);

const renderClassCardSkeleton = (key) => (
  <div key={key} className={`${glassPanelClass} flex h-full flex-col rounded-2xl p-5 animate-pulse`}>
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-100" />
      </div>
      <div className="h-5 w-16 rounded-full bg-slate-100" />
    </div>
    <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-1.5">
          <div className="h-2.5 w-20 rounded bg-slate-100" />
          <div className="h-3.5 w-14 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-10 w-full rounded-xl bg-slate-100" />
    </div>
  </div>
);

const ClassManagementDashboard = () => {
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const showClassSkeleton = isLoadingClasses && classes.length === 0;

  useEffect(() => {
    let isMounted = true;

    const fetchLecturerClasses = async () => {
      if (!lecturerId) {
        setClasses([]);
        setError('');
        return;
      }

      setIsLoadingClasses(true);
      setError('');

      try {
        const payload = await getLecturerClasses(lecturerId);
        const { classes: apiClasses, missingFields } = normaliseClassResponse(payload);

        if (!isMounted) {
          return;
        }

        setClasses(apiClasses);

        if (missingFields.length > 0) {
          missingFields.forEach((field) => {
            const reason = REQUIRED_CLASS_FIELDS[field];
            console.warn(
              `[Lecturer Dashboard] Missing '${field}' in /api/class/lecturer response. ${reason ?? 'This field powers lecturer dashboard UI elements.'}`
            );
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load lecturer classes from /api/class/lecturer.', error);
        setClasses([]);
        setError('Unable to load your classes right now. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    };

    fetchLecturerClasses();

    return () => {
      isMounted = false;
    };
  }, [lecturerId]);

  const orderedClasses = useMemo(() => {
    const toTimestamp = (value) => {
      if (!value) return 0;
      const parsed = new Date(value).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...classes].sort((a, b) => toTimestamp(b.createdDate) - toTimestamp(a.createdDate));
  }, [classes]);

  const subjects = useMemo(
    () => Array.from(new Set(classes.map((cls) => cls.subjectCode).filter(Boolean))),
    [classes]
  );

  const filteredClasses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orderedClasses.filter((cls) => {
      const matchesSearch =
        !normalizedSearch.length ||
        cls.className?.toLowerCase().includes(normalizedSearch) ||
        cls.subjectName?.toLowerCase().includes(normalizedSearch) ||
        cls.subjectCode?.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? cls.isActive : !cls.isActive);
      const matchesSubject = subjectFilter === 'all' || cls.subjectCode === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [orderedClasses, searchTerm, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((acc, cls) => acc + (cls.memberCount || 0), 0);
    const totalTeams = classes.reduce((acc, cls) => acc + (cls.teamCount || 0), 0);
    const activeClasses = classes.filter((cls) => cls.isActive).length;
    const averageClassSize = classes.length ? Math.round(totalStudents / classes.length) : 0;

    return {
      totalClasses: classes.length,
      totalStudents,
      totalTeams,
      activeClasses,
      averageClassSize
    };
  }, [classes]);

  const classStatCards = [
    {
      id: 'activeClasses',
      label: 'Active classes',
      value: `${stats.activeClasses}/${stats.totalClasses || '—'}`,
      description: 'Currently in delivery or grading.',
      icon: AcademicCapIcon,
      accent: 'from-indigo-500/40 to-sky-400/30 text-indigo-700'
    },
    {
      id: 'totalStudents',
      label: 'Students enrolled',
      value: stats.totalStudents,
      description: 'Active enrolments across classes.',
      icon: UserGroupIcon,
      accent: 'from-emerald-400/40 to-teal-300/20 text-emerald-700'
    },
    {
      id: 'totalTeams',
      label: 'Teams tracked',
      value: stats.totalTeams,
      description: 'Derived from team records.',
      icon: Squares2X2Icon,
      accent: 'from-sky-400/40 to-cyan-300/20 text-sky-700'
    },
    {
      id: 'averageClassSize',
      label: 'Average class size',
      value: stats.averageClassSize,
      description: 'Helps balance cohorts.',
      icon: ClipboardDocumentListIcon,
      accent: 'from-amber-300/40 to-orange-200/20 text-amber-700'
    }
  ];

  const handleViewClass = (classId) => {
    navigate(`/lecturer/classes/${classId}`);
  };

  const handleCreateProject = () => {
    navigate('/lecturer/projects/create');
  };

  const updateSearchTerm = (value) => {
    setSearchTerm(value);
  };

  const commitSearch = () => {
    const normalized = searchTerm.trim();
    if (!normalized) {
      return;
    }
    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((term) => term !== normalized)];
      return next.slice(0, 3);
    });
  };

  const subjectGradient = (subjectCode) => {
    if (!subjectCode) return 'from-slate-50 via-white to-slate-100';
    const baseHash = subjectCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const palettes = [
      'from-sky-100 via-white to-cyan-50',
      'from-indigo-100 via-white to-purple-50',
      'from-emerald-100 via-white to-lime-50',
      'from-amber-100 via-white to-orange-50'
    ];
    return palettes[baseHash % palettes.length];
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />
          <header className="relative flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Class Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                {stats.totalClasses > 0
                  ? `You are currently assigned to ${stats.totalClasses} classes (${stats.activeClasses} active).`
                  : 'No classes are assigned to you yet.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateProject}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Create New Project
            </button>
          </header>

          <section className="relative">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {showClassSkeleton
                ? classStatCards.map((card) => renderClassStatSkeleton(card.id))
                : classStatCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.id} className={`${glassPanelClass} rounded-2xl p-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                          </div>
                          <div className={`rounded-xl bg-gradient-to-br ${card.accent} p-3`}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-600">{card.description}</p>
                      </div>
                    );
                  })}
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="space-y-6">
            <div className={`${glassPanelClass} flex flex-col gap-4 rounded-3xl p-5 lg:flex-row lg:items-center lg:justify-between`}>
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Search classes</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <input
                      value={searchTerm}
                      onChange={(event) => updateSearchTerm(event.target.value)}
                      onBlur={commitSearch}
                      placeholder="Search by class, subject, or code"
                      className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                    {recentSearches.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSearchTerm(term);
                            }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">{filteredClasses.length} result(s)</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'inactive', label: 'Inactive' }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStatusFilter(option.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      statusFilter === option.id
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                        : 'bg-white/80 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <div className="hidden h-6 w-px bg-slate-200 lg:block" />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjectFilter('all')}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      subjectFilter === 'all'
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    All subjects
                  </button>
                  {subjects.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSubjectFilter(code)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        subjectFilter === code
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Class roster</p>
                <h2 className="text-xl font-semibold text-slate-900">Assigned classes</h2>
                <p className="text-sm text-slate-500">Data sourced directly from GET /class</p>
              </div>
              <span className="text-sm text-slate-500">{filteredClasses.length} item(s)</span>
            </div>

            {showClassSkeleton && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => renderClassCardSkeleton(`skeleton-${index}`))}
              </div>
            )}

            {!showClassSkeleton && filteredClasses.length === 0 && (
              <div className={`${glassPanelClass} flex flex-col items-center gap-3 rounded-3xl p-12 text-center`}>
                <p className="text-sm font-semibold text-slate-800">No classes available</p>
                <p className="text-sm text-slate-500">Classes assigned to you will appear here automatically.</p>
              </div>
            )}

            {!showClassSkeleton && filteredClasses.length > 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredClasses.map((cls) => (
                  <ClassCard key={cls.classId} cls={cls} onView={handleViewClass} subjectGradient={subjectGradient} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
      isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-600'
    }`}
  >
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const MetricChip = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">
      <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-base font-semibold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
};

const ClassCard = ({ cls, onView, subjectGradient }) => {
  const handleClick = () => {
    if (cls.classId !== null && cls.classId !== undefined) {
      onView(cls.classId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${glassPanelClass} flex h-full flex-col rounded-3xl bg-gradient-to-br ${subjectGradient(
        cls.subjectCode
      )} p-5 text-left transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{cls.semesterName}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{cls.className}</h3>
          <p className="text-sm text-slate-500">
            {cls.subjectName}
            {cls.subjectCode ? ` · ${cls.subjectCode}` : ''}
          </p>
        </div>
        <StatusBadge isActive={cls.isActive} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <MetricChip icon={UserGroupIcon} label="Total students" value={cls.memberCount ?? 0} />
        <MetricChip icon={Squares2X2Icon} label="Formed teams" value={cls.teamCount ?? 0} />
      </div>

      <div className="mt-6 text-xs text-slate-500">
        Created {cls.createdDate ? new Date(cls.createdDate).toLocaleDateString() : '—'}
      </div>
    </button>
  );
};

export default ClassManagementDashboard;