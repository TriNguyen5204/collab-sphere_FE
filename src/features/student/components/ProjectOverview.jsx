import React, { useState } from 'react';
import { CalendarClock, BookOpen, User, Info, Users, Shield, Target } from 'lucide-react';
import { Skeleton } from './skeletons/StudentSkeletons';

// Helper for status colors - kept semantic logic but refined styles
const statusColor = (statusString, status) => {
    const key = (statusString || '').toUpperCase();
    switch (key) {
        case 'APPROVED':
            return 'bg-green-50 text-green-700 ring-green-600/20';
        case 'PENDING':
            return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
        case 'REJECTED':
            return 'bg-red-50 text-red-700 ring-red-600/20';
        default:
            if (status === 1) return 'bg-green-50 text-green-700 ring-green-600/20';
            return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
};

const formatDate = (iso) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return iso;
    }
};

const ProjectOverview = ({ project, loading = false, error = null, className = '', compact = false }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showBusinessRules, setShowBusinessRules] = useState(false);

    // BRAND COLOR: #ea792d
    // Using arbitrary values [#ea792d] to ensure it works instantly.
    // You can replace these with 'text-orangeFpt' etc if you have configured tailwind.config.js

    if (loading) {
        return (
            <section className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
                <div className={`${compact ? 'p-4' : 'p-6'} space-y-4`}>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2 w-full max-w-[70%]">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="pt-4 space-y-2">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-sm p-6 border border-red-100 ${className}`}>
                <div className="flex items-center gap-3 text-red-600">
                    <Shield className="h-5 w-5" />
                    <p>Failed to load project details.</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    const {
        projectName,
        description,
        lecturerCode,
        lecturerName,
        subjectName,
        subjectCode,
        status,
        statusString,
        createdAt,
        updatedAt,
        businessRules,
        actors,
    } = project || {};

    const rulesList = businessRules ? businessRules.split('\n').filter(rule => rule.trim()) : [];
    const actorsList = actors ? actors.split(',').map(a => a.trim()) : [];

    return (
        <section className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col  ${className}`}>
            
            {/* Header with Brand Color Accent */}
            <div className={`relative border-b border-gray-100 ${compact ? 'p-4' : 'p-6'}`}>
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div className="min-w-0 flex-1">
                        <h2 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-orangeFpt-500 uppercase tracking-wide flex items-center gap-2 mb-1`}>
                            <Target size={16} />
                            Project Overview
                        </h2>
                        <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 leading-tight truncate`} title={projectName}>
                            {projectName}
                        </h3>
                    </div>
                    <div className={`shrink-0 inline-flex items-center ${compact ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'} font-medium rounded-full ring-1 ring-inset ${statusColor(statusString, status)}`}>
                        {statusString || 'UNKNOWN'}
                    </div>
                </div>

                {/* Meta Data Grid */}
                <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-2' : 'gap-4'}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="bg-white p-1.5 rounded-md shadow-sm text-orangeFpt-500">
                            <User size={compact ? 16 : 18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Lecturer</p>
                            <p className={`text-sm font-semibold text-gray-800 truncate`} title={lecturerName}>
                                {lecturerName || '-'} 
                                {lecturerCode && <span className="text-gray-400 font-normal ml-1">({lecturerCode})</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="bg-white p-1.5 rounded-md shadow-sm text-orangeFpt-500">
                            <BookOpen size={compact ? 16 : 18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Subject</p>
                            <p className={`text-sm font-semibold text-gray-800 truncate`} title={subjectName}>
                                {subjectName || '-'}
                                {subjectCode && <span className="text-gray-400 font-normal ml-1">({subjectCode})</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarClock size={14} />
                    <span>Created: {formatDate(createdAt)}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(updatedAt)}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className={`${compact ? 'p-4' : 'p-6'} space-y-6 bg-white flex-1`}>
                
                {/* Description */}
                {description && (
                    <div className="group">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Info size={16} className="text-orangeFpt-500" />
                            Description
                        </h4>
                        <div className="text-sm text-gray-600 leading-relaxed relative">
                            <p className={showFullDescription ? '' : 'line-clamp-3'}>
                                {description}
                            </p>
                            {description.length > 200 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-orangeFpt-500 hover:text-orangeFpt-600 text-xs mt-1 font-medium hover:underline focus:outline-none"
                                >
                                    {showFullDescription ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Actors - Styled as Brand Pills */}
                {actorsList.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Users size={16} className="text-orangeFpt-500" />
                            Actors involved
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {actorsList.map((actor, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-orangeFpt-500/10 text-orangeFpt-500 border border-orangeFpt-500/20 transition-colors hover:bg-orangeFpt-500/20"
                                >
                                    {actor}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Business Rules */}
                {rulesList.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield size={16} className="text-orangeFpt-500" />
                            Business Rules
                        </h4>
                        <ul className="space-y-2">
                            {(showBusinessRules ? rulesList : rulesList.slice(0, 3)).map((rule, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-gray-600 items-start">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orangeFpt-500 shrink-0"></span>
                                    <span>{rule.replace(/^\d+\.\s*/, '')}</span>
                                </li>
                            ))}
                        </ul>
                        {rulesList.length > 3 && (
                            <button
                                onClick={() => setShowBusinessRules(!showBusinessRules)}
                                className="text-orangeFpt-500 hover:text-orangeFpt-600 text-xs mt-3 font-medium hover:underline flex items-center gap-1"
                            >
                                {showBusinessRules ? 'Collapse rules' : `View all ${rulesList.length} rules`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectOverview;