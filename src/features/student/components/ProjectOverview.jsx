import React, { useState } from 'react';
import { CalendarClock, BookOpen, User, Info, Users, Shield } from 'lucide-react';
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

const ProjectOverview = ({ project, loading = false, error = null, className = '', compact = false }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showBusinessRules, setShowBusinessRules] = useState(false);
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

                    <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
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
                        </div>
                    </div>
                </div>

                {/* Content skeleton */}
                <div className={`${compact ? 'p-3' : 'p-5'} space-y-4`}>
                    <div>
                        <Skeleton className={`${compact ? 'h-3 w-20' : 'h-4 w-24'} mb-2`} />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div>
                        <Skeleton className={`${compact ? 'h-3 w-24' : 'h-4 w-28'} mb-2`} />
                        <Skeleton className="h-16 w-full" />
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
        businessRules,
        actors,
    } = project || {};

    // Parse business rules if it's a string
    const rulesList = businessRules ? businessRules.split('\n').filter(rule => rule.trim()) : [];
    const actorsList = actors ? actors.split(',').map(a => a.trim()) : [];

    return (
        <section className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            {/* Header */}
            <div className={`${compact ? 'p-3' : 'p-5'} border-b bg-gradient-to-r from-slate-50 to-white`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className={`${compact ? 'text-base' : 'text-xl'} font-semibold text-slate-900 flex items-center gap-2 mb-2`}>
                            <Info className="text-blue-500 shrink-0" size={compact ? 16 : 20} />
                            <span className="truncate">Project Overview</span>
                        </h2>
                        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium text-slate-800 truncate`} title={projectName}>
                            {projectName}
                        </h3>
                    </div>
                    <div className={`shrink-0 inline-flex items-center ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} font-medium rounded-full ring-1 ring-inset ${statusColor(statusString, status)}`}>
                        {statusString || 'UNKNOWN'}
                    </div>
                </div>

                <div className={`${compact ? 'mt-2' : 'mt-3'} grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
                    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <User size={compact ? 14 : 16} className="text-slate-500 shrink-0" />
                        <div className="truncate">
                            <span className="font-medium">Lecturer:</span>{' '}
                            <span title={lecturerName}>{lecturerName || '-'}</span>
                            {lecturerCode ? <span className="text-slate-500"> ({lecturerCode})</span> : null}
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <BookOpen size={compact ? 14 : 16} className="text-slate-500 shrink-0" />
                        <div className="truncate">
                            <span className="font-medium">Subject:</span>{' '}
                            <span title={subjectName}>{subjectName || '-'}</span>
                            {subjectCode ? <span className="text-slate-500"> ({subjectCode})</span> : null}
                        </div>
                    </div>
                </div>

                <div className={`${compact ? 'mt-2' : 'mt-3'}`}>
                    <div className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                        <CalendarClock size={compact ? 14 : 16} className="text-slate-500 mt-0.5 shrink-0" />
                        <div className="whitespace-normal break-words">
                            <span className="font-medium">Created:</span>{' '}
                            <span title={formatDate(createdAt)}>{formatDate(createdAt)}</span>
                            <span className="mx-2 text-slate-400">•</span>
                            <span className="font-medium">Updated:</span>{' '}
                            <span title={formatDate(updatedAt)}>{formatDate(updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content sections */}
            <div className={`${compact ? 'p-3' : 'p-5'} space-y-4`}>
                {/* Description */}
                {description && (
                    <div>
                        <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-slate-700 mb-2`}>
                            Description
                        </h4>
                        <div className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 bg-slate-50 rounded-lg p-3`}>
                            <p className={showFullDescription ? '' : 'line-clamp-3'}>
                                {description}
                            </p>
                            {description.length > 200 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                                >
                                    {showFullDescription ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Actors */}
                {actorsList.length > 0 && (
                    <div>
                        <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-slate-700 mb-2 flex items-center gap-2`}>
                            <Users size={compact ? 14 : 16} className="text-slate-500" />
                            Actors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {actorsList.map((actor, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} font-medium rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200`}
                                >
                                    {actor}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Business Rules */}
                {rulesList.length > 0 && (
                    <div>
                        <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-slate-700 mb-2 flex items-center gap-2`}>
                            <Shield size={compact ? 14 : 16} className="text-slate-500" />
                            Business Rules
                        </h4>
                        <div className={`bg-slate-50 rounded-lg p-3 ${compact ? 'text-xs' : 'text-sm'} text-slate-700`}>
                            <ul className="space-y-1">
                                {(showBusinessRules ? rulesList : rulesList.slice(0, 3)).map((rule, idx) => (
                                    <li key={idx} className="flex gap-2">
                                        <span className="text-blue-500 shrink-0">•</span>
                                        <span>{rule.replace(/^\d+\.\s*/, '')}</span>
                                    </li>
                                ))}
                            </ul>
                            {rulesList.length > 3 && (
                                <button
                                    onClick={() => setShowBusinessRules(!showBusinessRules)}
                                    className="text-blue-600 hover:text-blue-700 text-xs mt-2 font-medium"
                                >
                                    {showBusinessRules ? 'Show less' : `Show all ${rulesList.length} rules`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectOverview;
