import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import { AcademicCapIcon, ClipboardDocumentListIcon, Squares2X2Icon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getLecturerClasses } from '../../services/classApi';
import { Search } from 'lucide-react';

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
      <div className="space-y-6">
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
            className="inline-flex items-center justify-center rounded-2xl bg-orangeFpt-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orangeFpt-500/30 transition hover:-translate-y-0.5 hover:bg-orangeFpt-600"
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
        <section className="space-y-8">
          {/* --- HEADER & CONTROLS --- */}
          <div className={`${glassPanelClass} overflow-hidden rounded-3xl border border-white/20 shadow-xl shadow-orange-500/5`}>

            {/* Top Bar: Title & Search */}
            <div className="flex flex-col gap-6 border-b border-slate-100 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Class Directory</h2>
                  <p className="text-sm text-slate-500">Manage and view your assigned academic rosters.</p>
                </div>

                {/* Search Input Area */}
                <div className="relative max-w-xl">
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      value={searchTerm}
                      onChange={(event) => updateSearchTerm(event.target.value)}
                      onBlur={commitSearch}
                      placeholder="Search by class, subject, or code..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-orange-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>

                  {/* Recent Searches Pills */}
                  {recentSearches.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-1">Recent:</span>
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setSearchTerm(term);
                          }}
                          className="group flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Result Count Badge (Top Right) */}
              <div className="hidden lg:block">
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 border border-orange-100">
                  {filteredClasses.length} Result{filteredClasses.length !== 1 && 's'}
                </span>
              </div>
            </div>

            {/* Bottom Bar: Filters */}
            <div className="flex flex-col gap-4 bg-slate-50/50 p-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Status Tabs */}
              <div className="flex rounded-xl bg-slate-200/50 p-1">
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'active', label: 'Active' },
                  { id: 'inactive', label: 'Inactive' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStatusFilter(option.id)}
                    className={`relative rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${statusFilter === option.id
                        ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Subject Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Subject:</span>
                <button
                  onClick={() => setSubjectFilter('all')}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${subjectFilter === 'all'
                      ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600'
                    }`}
                >
                  All
                </button>
                {subjects.map((code) => (
                  <button
                    key={code}
                    onClick={() => setSubjectFilter(code)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${subjectFilter === code
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600'
                      }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- GRID CONTENT --- */}
          <div className="space-y-4">
            {/* Mobile Result Count (Visible only on small screens) */}
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="text-lg font-bold text-slate-800">Assigned Classes</h3>
              <span className="text-sm font-medium text-slate-500">{filteredClasses.length} results</span>
            </div>

            {showClassSkeleton && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => renderClassCardSkeleton(`skeleton-${index}`))}
              </div>
            )}

            {!showClassSkeleton && filteredClasses.length === 0 && (
              <div className={`${glassPanelClass} flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-16 text-center`}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                  <Search className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No classes found</h3>
                <p className="mt-1 text-slate-500">
                  We couldn't find any classes matching "{searchTerm}" with the selected filters.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSubjectFilter('all'); }}
                  className="mt-6 rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 hover:shadow-orange-300"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!showClassSkeleton && filteredClasses.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredClasses.map((cls) => (
                  <ClassCard key={cls.classId} cls={cls} onView={handleViewClass} subjectGradient={subjectGradient} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${isActive
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