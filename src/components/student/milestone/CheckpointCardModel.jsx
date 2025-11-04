import React, { useEffect, useRef } from 'react';
import { Calendar, Clock, Users, X, AlertCircle, FileText, Loader2, Edit2, Trash2, } from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';

const formatDate = (value) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getStatusBadgeStyles = (status) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-700 border border-green-200';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-700 border border-blue-200';
        case 'NOT_DONE':
        default:
            return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
};

const CheckpointCardModal = ({
    isOpen,
    onClose,
    detail,
    isLoading,
    error,
    fallbackTitle,
}) => {
    const modalRef = useRef(null);

    useClickOutside(modalRef, () => {
        if (isOpen) {
            onClose?.();
        }
    });

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const normalizedStatus = (detail?.statusString || '').replace(/_/g, ' ');
    const assignments = Array.isArray(detail?.checkpointAssignments)
        ? detail.checkpointAssignments
        : [];
    const files = Array.isArray(detail?.checkpointFiles) ? detail.checkpointFiles : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                ref={modalRef}
                className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkpoint-modal-title"
            >
                <div className="flex items-start justify-between border-b px-6 py-4">
                    <div className="flex">
                        <h2 id="checkpoint-modal-title" className="text-xl font-semibold text-gray-900">
                            {detail?.title || fallbackTitle}
                        </h2>
                        {normalizedStatus && (
                            <span className={`rounded-full px-3 py-1 ml-2 text-xs font-semibold uppercase ${getStatusBadgeStyles(detail.statusString)}`}>
                                {normalizedStatus}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                // onClick={() => canAssign && onAssign?.(checkpoint)}
                                // disabled={!canAssign}
                                title='Assign Members'
                                className={'p-2 rounded-lg transition text-purple-600 hover:bg-purple-50'}
                            >
                                <Users size={18} />
                            </button>
                            <button
                                // onClick={() => canEdit && onEdit(checkpoint)}
                                // disabled={!canEdit}
                                title='Edit Checkpoint'
                                className={'p-2 rounded-lg transition text-blue-600 hover:bg-blue-50'}
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                // onClick={() => canEdit && onDelete(checkpoint.id)}
                                // disabled={!canEdit}
                                title='Delete Checkpoint'
                                className={'p-2 rounded-lg transition text-red-600 hover:bg-red-50'}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                            aria-label="Close checkpoint details"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
                            <Loader2 className="animate-spin" size={28} />
                            <span className="text-sm">Loading checkpoint details...</span>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle size={20} className="mt-0.5" />
                            <div>
                                <p className="font-medium">Something went wrong</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && detail && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                                <p className="text-sm text-gray-700">{detail.description || 'No description provided.'}</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        <Calendar size={18} className="text-gray-500" />
                                        <div>
                                            <p className="text-xs uppercase text-gray-500">Start date</p>
                                            <p className="font-medium">{formatDate(detail.startDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        <Clock size={18} className="text-gray-500" />
                                        <div>
                                            <p className="text-xs uppercase text-gray-500">Due date</p>
                                            <p className="font-medium">{formatDate(detail.dueDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        <FileText size={18} className="text-gray-500" />
                                        <div>
                                            <p className="text-xs uppercase text-gray-500">Complexity</p>
                                            <p className="font-medium">{(detail.complexity || 'UNKNOWN').replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Assignees</h3>
                                </div>
                                {assignments.length === 0 ? (
                                    <p className="text-sm text-gray-600">No assignees yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {assignments.map((assignment) => (
                                            <li
                                                key={assignment.checkpointAssignmentId || assignment.studentId || assignment.classMemberId}
                                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                                            >
                                                <p className="font-medium text-gray-900">{assignment.fullname || assignment.studentCode || 'Unnamed member'}</p>
                                                <p className="text-xs text-gray-500">{assignment.studentCode ? `Student Code: ${assignment.studentCode}` : 'Code unavailable'}</p>
                                                <p className="text-xs text-gray-500">
                                                    Role: {(assignment.teamRoleString || 'UNKNOWN').replace(/_/g, ' ')}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText size={20} className="text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                                </div>
                                {files.length === 0 ? (
                                    <p className="text-sm text-gray-600">No files uploaded yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {files.map((file) => {
                                            const name = file.originalFileName || file.fileName || file.name || 'Attachment';
                                            return (
                                                <li key={file.checkpointFileId || name} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                                                    {name}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && !detail && (
                        <p className="text-center text-sm text-gray-500">No details available for this checkpoint.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckpointCardModal;
