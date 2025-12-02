import React, { useMemo, useState } from 'react';
import { CalendarClock, BookOpen, User, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { Skeleton } from './skeletons/StudentSkeletons';

const statusColor = (statusString, status) => {
    const key = (statusString || '').toUpperCase();
    switch (key) {
        case 'APPROVED':
            return 'bg-green-100 text-green-800 ring-green-200';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800 ring-yellow-200';
        case 'REJECTED':
            return 'bg-red-100 text-red-800 ring-red-200';
        default:
            if (status === 1) return 'bg-green-100 text-green-800 ring-green-200';
            return 'bg-gray-100 text-gray-800 ring-gray-200';
    }
};

const formatDate = (iso) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
};

const formatYMD = (ymd) => {
    if (!ymd) return '-';
    try {
        const d = new Date(ymd);
        return d.toLocaleDateString();
    } catch {
        return ymd;
    }
};

const PriorityBadge = ({ priority }) => {
    const p = (priority || '').toLowerCase();
    const map = {
        high: 'bg-red-100 text-red-700 ring-red-200',
        medium: 'bg-amber-100 text-amber-700 ring-amber-200',
        low: 'bg-green-100 text-green-700 ring-green-200',
    };
    const cls = map[p] || 'bg-gray-100 text-gray-700 ring-gray-200';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ${cls}`}>
            {priority || 'Unknown'}
        </span>
    );
};

const ProjectOverview = ({ project, loading = false, error = null, className = '', compact = false }) => {
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    const toggleObjective = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const allExpanded = useMemo(() => {
        const count = project?.objectives?.length || 0;
        return count > 0 && expandedIds.size === count;
    }, [expandedIds, project?.objectives]);

    const toggleAll = () => {
        const list = project?.objectives || [];
        if (allExpanded) {
            setExpandedIds(new Set());
        } else {
            setExpandedIds(new Set(list.map((o) => o.objectiveId)));
        }
    };
    if (loading) {
        return (
            <section className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
                {/* Header skeleton */}
                <div className={`${compact ? 'p-3' : 'p-5'} border-b`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} rounded`} />
                                <Skeleton className={`${compact ? 'h-4 w-32' : 'h-5 w-40'}`} />
                            </div>
                            <Skeleton className={`${compact ? 'h-4 w-48' : 'h-5 w-64'} mb-2`} />
                            <Skeleton className={`${compact ? 'h-3 w-full' : 'h-4 w-full'} mb-2`} />
                            <Skeleton className={`${compact ? 'h-3 w-5/6' : 'h-4 w-5/6'}`} />
                        </div>
                        <Skeleton className={`${compact ? 'h-4 w-16' : 'h-5 w-20'} rounded-full`} />
                    </div>

                    <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-1 sm:grid-cols-3 ${compact ? 'gap-2' : 'gap-3'}`}>
                        <div className="flex items-center gap-2">
                            <Skeleton className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} rounded`} />
                            <Skeleton className={`${compact ? 'h-3 w-40' : 'h-4 w-48'}`} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} rounded`} />
                            <Skeleton className={`${compact ? 'h-3 w-40' : 'h-4 w-48'}`} />
                        </div>
                    </div>
                    <div className={`${compact ? 'mt-2' : 'mt-3'}`}>
                        <div className="flex items-center gap-3">
                            <Skeleton className={`${compact ? 'h-3 w-24' : 'h-4 w-28'}`} />
                            <Skeleton className={`${compact ? 'h-3 w-28' : 'h-4 w-36'}`} />
                            <Skeleton className={`${compact ? 'h-3 w-24' : 'h-4 w-28'}`} />
                            <Skeleton className={`${compact ? 'h-3 w-28' : 'h-4 w-36'}`} />
                        </div>
                    </div>
                </div>

                {/* Objectives skeleton */}
                <div className={`${compact ? 'p-3' : 'p-5'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className={`${compact ? 'h-3 w-24' : 'h-4 w-28'}`} />
                        <Skeleton className={`${compact ? 'h-3 w-20' : 'h-4 w-24'}`} />
                    </div>
                    <div className={`${compact ? 'space-y-3' : 'space-y-4'}`}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border rounded-lg">
                                <div className={`${compact ? 'p-3' : 'p-4'} bg-slate-50`}>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} rounded`} />
                                        <Skeleton className={`${compact ? 'h-4 w-56' : 'h-5 w-64'}`} />
                                        <Skeleton className={`${compact ? 'h-4 w-16' : 'h-5 w-20'} rounded-full`} />
                                    </div>
                                </div>
                                <div className={`${compact ? 'p-3' : 'p-4'}`}>
                                    <div className="flex items-center justify-between">
                                        <Skeleton className={`${compact ? 'h-3 w-40' : 'h-4 w-48'}`} />
                                        <Skeleton className={`${compact ? 'h-3 w-28' : 'h-4 w-32'}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-md p-5 border border-red-200 ${className}`}>
                <p className="text-red-600">Failed to load project: {String(error)}</p>
            </div>
        );
    }

    if (!project) return null;

    const {
        projectId,
        projectName,
        description,
        lecturerId,
        lecturerCode,
        lecturerName,
        subjectId,
        subjectName,
        subjectCode,
        status,
        statusString,
        createdAt,
        updatedAt,
        objectives = [],
    } = project || {};

    return (
        <section className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            {/* Header */}
            <div className={`${compact ? 'p-3' : 'p-5'} border-b bg-gradient-to-r from-slate-50 to-white`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className={`${compact ? 'text-base' : 'text-xl'} font-semibold text-slate-900 truncate flex items-center gap-2`}>
                            <Info className="text-blue-500" size={compact ? 16 : 20} />
                            Project Overview
                        </h2>
                        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium text-slate-800 mt-1 truncate`} title={projectName}>
                            {projectName}
                        </h3>
                        {description && (
                            <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 mt-1 line-clamp-2`}>{description}</p>
                        )}
                    </div>
                    <div className={`shrink-0 inline-flex items-center ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} font-medium rounded-full ring-1 ring-inset ${statusColor(statusString, status)}`}>
                        {statusString || 'UNKNOWN'}
                    </div>
                </div>

                <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-1 sm:grid-cols-3 ${compact ? 'gap-2' : 'gap-3'}`}>
                    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <User size={compact ? 14 : 16} className="text-slate-500" />
                        <div className="truncate">
                            <span className="font-medium">Lecturer:</span>{' '}
                            <span title={lecturerName}>{lecturerName || '-'}</span>
                            {lecturerCode ? <span className="text-slate-500"> ({lecturerCode})</span> : null}
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <BookOpen size={compact ? 14 : 16} className="text-slate-500" />
                        <div className="truncate">
                            <span className="font-medium">Subject:</span>{' '}
                            <span title={subjectName}>{subjectName || '-'}</span>
                            {subjectCode ? <span className="text-slate-500"> ({subjectCode})</span> : null}
                        </div>
                    </div>
                </div>
                <div className={ `${compact ? 'mt-2' : 'mt-3'}`}>
                    <div className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <CalendarClock size={compact ? 14 : 16} className="text-slate-500 mt-0.5" />
                        <div className="whitespace-normal break-words">
                            <span className="font-medium">Created:</span>{' '}
                            <span title={formatDate(createdAt)}>{formatDate(createdAt)}</span>
                            <span className="mx-2 text-slate-400 hidden sm:inline">•</span>
                            <br className="sm:hidden" />
                            <span className="font-medium">Updated:</span>{' '}
                            <span title={formatDate(updatedAt)}>{formatDate(updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Objectives & Milestones */}
            <div className={`${compact ? 'p-3' : 'p-5'}`}>
                <div className="flex items-center justify-between">
                    <h4 className={`${compact ? 'text-xs mb-2' : 'text-sm mb-3'} font-semibold text-slate-700`}>Objectives</h4>
                    {(project?.objectives?.length || 0) > 0 && (
                        <button
                            type="button"
                            onClick={toggleAll}
                            className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate-600 hover:underline`}
                        >
                            {allExpanded ? 'Collapse all' : 'Expand all'}
                        </button>
                    )}
                </div>
                {objectives.length === 0 ? (
                    <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500`}>No objectives yet.</p>
                ) : (
                    <div className={`${compact ? 'space-y-3' : 'space-y-4'}`}>
                        {objectives.map((obj) => (
                            <div key={obj.objectiveId} className="border rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => toggleObjective(obj.objectiveId)}
                                    className={`${compact ? 'p-3' : 'p-4'} w-full text-left flex flex-col sm:flex-row sm:items-center justify-between ${compact ? 'gap-2' : 'gap-3'} bg-slate-50 hover:bg-slate-100`}
                                >
                                    <div className="min-w-0">
                                        <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
                                            <ChevronDown
                                                size={compact ? 14 : 16}
                                                className={`text-slate-600 transition-transform ${expandedIds.has(obj.objectiveId) ? 'rotate-180' : ''}`}
                                            />
                                            <span className={`${compact ? 'text-sm' : 'text-base'} text-slate-900 font-medium truncate`} title={obj.description}>{obj.description}</span>
                                            <PriorityBadge priority={obj.priority} />
                                        </div>
                                    </div>
                                    <div className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate-500 shrink-0`}>
                                        {obj.objectiveMilestones?.length || 0} milestone(s)
                                    </div>
                                </button>

                                {/* Milestones timeline */}
                                {expandedIds.has(obj.objectiveId) && (
                                    <div className={`${compact ? 'p-3' : 'p-4'}`}>
                                        {(!obj.objectiveMilestones || obj.objectiveMilestones.length === 0) ? (
                                            <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500`}>No milestones.</p>
                                        ) : (
                                            <ol className="relative border-s border-slate-200 ms-3">
                                                {obj.objectiveMilestones.map((ms) => (
                                                    <li key={ms.objectiveMilestoneId} className={`${compact ? 'mb-3' : 'mb-4'} ms-4`}>
                                                        <div className={`absolute ${compact ? 'w-1.5 h-1.5 mt-2' : 'w-2 h-2 mt-2.5'} bg-blue-500 rounded-full -start-1`}></div>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'} text-slate-900 font-medium`}>
                                                                    <ChevronRight size={compact ? 12 : 14} className="text-blue-500" />
                                                                    <span className={`${compact ? 'text-sm' : ''} truncate`} title={ms.title}>{ms.title}</span>
                                                                </div>
                                                                {ms.description && (
                                                                    <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 mt-1`}>{ms.description}</p>
                                                                )}
                                                            </div>
                                                            <div className={`${compact ? 'text-[11px]' : 'text-xs'} text-slate-500 shrink-0`}>
                                                                {formatYMD(ms.startDate)} – {formatYMD(ms.endDate)}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectOverview;
