import React, { useEffect, useRef } from 'react';
import { Calendar, Clock, Users, X, AlertCircle, FileText, Loader2, Edit2, Trash2, History, User, Upload, CheckCircle } from 'lucide-react';
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

const countTimeRemaining = (dueDate) => {
    if (!dueDate) {
        return { text: '—', color: 'text-gray-500' };
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
        return { text: 'Invalid date', color: 'text-gray-500' };
    }

    const now = new Date();
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const formattedDate = due.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    if (daysDiff < 0) {
        // Overdue
        return {
            text: `${formattedDate} • Overdue`,
            color: 'text-red-600'
        };
    } else if (daysDiff === 0) {
        // Due today
        return {
            text: `${formattedDate} • Due today`,
            color: 'text-orange-600'
        };
    } else if (daysDiff === 1) {
        // Due tomorrow
        return {
            text: `${formattedDate} • 1 day remaining`,
            color: 'text-green-600'
        };
    } else {
        // Due in multiple days
        return {
            text: `${formattedDate} • ${daysDiff} days remaining`,
            color: 'text-green-600'
        };
    }
};

const CheckpointCardModal = ({
    isOpen,
    onClose,
    detail,
    isLoading,
    error,
    fallbackTitle,
    fallbackCheckpoint,
    canUpload = false,
    readOnly = false,
    uiStatus,
    localFiles = [],
    onSelectLocalFiles,
    onRemoveLocalFile,
    onUploadLocalFiles,
    uploadDisabled = true,
    onMarkComplete,
    onDeleteSubmission,
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

    const resolvedDetail = detail ?? fallbackCheckpoint ?? {};
    const statusRaw = resolvedDetail?.statusString ?? resolvedDetail?.status ?? fallbackCheckpoint?.statusString ?? fallbackCheckpoint?.status ?? '';
    const statusForBadge = typeof statusRaw === 'string' ? statusRaw : statusRaw?.toString?.() ?? '';
    const normalizedStatus = statusForBadge
        ? statusForBadge.toString().replace(/_/g, ' ')
        : '';
    const assignments = Array.isArray(resolvedDetail?.checkpointAssignments)
        ? resolvedDetail.checkpointAssignments
        : Array.isArray(resolvedDetail?.assignments)
            ? resolvedDetail.assignments
            : [];
    const files = Array.isArray(resolvedDetail?.checkpointFiles)
        ? resolvedDetail.checkpointFiles
        : Array.isArray(resolvedDetail?.submissions)
            ? resolvedDetail.submissions
            : [];
    const checkpointId = resolvedDetail?.checkpointId ?? resolvedDetail?.id ?? resolvedDetail?.checkpointID ?? fallbackCheckpoint?.id ?? null;
    const complexity = resolvedDetail?.complexity ?? fallbackCheckpoint?.complexity ?? '';
    const description = resolvedDetail?.description ?? fallbackCheckpoint?.description ?? '';
    const startDate = resolvedDetail?.startDate ?? fallbackCheckpoint?.startDate ?? null;
    const dueDate = resolvedDetail?.dueDate ?? resolvedDetail?.deadline ?? resolvedDetail?.endDate ?? fallbackCheckpoint?.dueDate ?? null;
    const normalizedFiles = Array.isArray(files)
        ? files.map((file, index) => ({
            id: file.checkpointFileId ?? file.submissionId ?? file.id ?? index,
            name: file.originalFileName ?? file.fileName ?? file.name ?? `Attachment ${index + 1}`,
            url: file.fileUrl ?? file.url ?? file.downloadUrl ?? file.path ?? file.filePath ?? null,
            uploadedBy: file.uploadedByName ?? file.uploadedBy ?? file.userName ?? file.createdBy ?? '',
            uploadedAt: file.uploadedAt ?? file.createdAt ?? file.submittedAt ?? file.createdDate ?? '',
            size: file.fileSize ?? file.size ?? null,
            raw: file,
        }))
        : [];
    const submissionsCount = normalizedFiles.length;
    const hasLocalFiles = Array.isArray(localFiles) && localFiles.length > 0;
    const canShowUpload = canUpload && !readOnly;
    const canRenderMarkComplete = (uiStatus ?? '').toString().toLowerCase() !== 'completed' && !readOnly;
    const fileInputId = checkpointId ? `cp-file-input-${checkpointId}` : 'cp-file-input';
    const isMarkCompleteDisabled = submissionsCount === 0;
    const markCompleteButtonDisabled = isMarkCompleteDisabled || typeof onMarkComplete !== 'function' || checkpointId == null;
    const hasResolvedData = detail != null || fallbackCheckpoint != null;

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
                    <div>
                        <div className="flex">
                            <h2 id="checkpoint-modal-title" className="text-xl font-semibold text-gray-900">
                                {resolvedDetail?.title || fallbackTitle}
                            </h2>
                            <div className="flex items-center gap-2 ml-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${complexity === 'HIGH' ? 'border-red-300 text-red-700 bg-red-50' :
                                    complexity === 'MEDIUM' ? 'border-amber-300 text-amber-700 bg-amber-50' :
                                        'border-green-300 text-green-700 bg-green-50'
                                    }`}>
                                    {complexity || ''}
                                </span>
                            </div>
                            {normalizedStatus && (
                                <span className={`rounded-full px-3 py-1 ml-2 text-xs font-semibold uppercase ${getStatusBadgeStyles(statusForBadge)}`}>
                                    {normalizedStatus}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Description: {description ? description : 'No description provided.'}
                            </p>
                        </div>
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

                    {!isLoading && !error && hasResolvedData && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                                <History size={20}/>
                                                <span>Overview</span>
                                            </h3>
                                        </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                    <div className="space-y-3">
                                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3 text-sm text-gray-700 flex flex-col">
                                            <p className="text-xs uppercase text-gray-500 flex items-center gap-2">
                                                <Calendar size={13} className="text-gray-500" />
                                                Start date
                                            </p>
                                            <div className="flex-1 flex items-center">
                                                <p className="font-medium">{formatDate(startDate)}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3 text-sm text-gray-700 flex flex-col">
                                            <p className="text-xs uppercase text-gray-500 flex items-center gap-2">
                                                <Clock size={13} className="text-gray-500" />
                                                Due date
                                            </p>
                                            <div className="flex-1 flex items-center">
                                                <p className={`font-medium ${countTimeRemaining(dueDate).color}`}>
                                                    {countTimeRemaining(dueDate).text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-3 text-sm h-full flex flex-col">
                                        <p className="text-xs uppercase text-gray-500 flex items-center gap-2">
                                            <User size={13} className="text-gray-500" />
                                            Assignee
                                        </p>
                                        {assignments.length === 0 ? (
                                            <div className="flex-1 flex items-center">
                                                <p className="font-medium text-gray-600">No assignees yet.</p>
                                            </div>
                                        ) : (
                                            <ul className="mt-3 space-y-2">
                                                {assignments.map((assignment) => (
                                                    <li
                                                        key={assignment.checkpointAssignmentId || assignment.classMemberId}
                                                        className="grid grid-cols-[40px,1fr] items-center gap-3 border-b border-gray-200 p-1 mt-1"
                                                    >
                                                        {assignment.avatarImg ? (
                                                            <img
                                                                src={assignment.avatarImg}
                                                                alt={assignment.fullname || 'Assignee avatar'}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                                                <User size={18} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {assignment.fullname || 'Unnamed member'}
                                                            </p>
                                                            <p className="text-xs font-medium uppercase text-gray-500">
                                                                {(assignment.teamRoleString || 'Member').replace(/_/g, ' ')}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="">
                                <div className="">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                                <Upload size={20} className="" />
                                                <span>Submissions ({submissionsCount})</span>
                                            </h3>
                                        </div>
                                        {submissionsCount === 0 ? (
                                            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center">
                                                <p className="text-sm text-gray-600">No submissions yet. Upload your first file to get started.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {normalizedFiles.map((file) => (
                                                    <li
                                                        key={file.id}
                                                        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                                <FileText size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{file.name}</p>
                                                                <div className="text-xs text-gray-500 space-x-3">
                                                                    {file.uploadedBy && <span>by {file.uploadedBy}</span>}
                                                                    {file.uploadedAt && <span>{formatDate(file.uploadedAt)}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 sm:justify-end">
                                                            {file.url ? (
                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                                                >
                                                                    View
                                                                </a>
                                                            ) : null}
                                                            {!readOnly && typeof onDeleteSubmission === 'function' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => checkpointId != null && onDeleteSubmission?.(checkpointId, file.id)}
                                                                    className="text-red-600 transition hover:text-red-700"
                                                                    aria-label="Remove submission"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {canShowUpload && (
                                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                                                    <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={onSelectLocalFiles}
                                                        id={fileInputId}
                                                        className="hidden"
                                                        disabled={typeof onSelectLocalFiles !== 'function'}
                                                    />
                                                    <label
                                                        htmlFor={fileInputId}
                                                        className={`font-semibold ${typeof onSelectLocalFiles === 'function'
                                                            ? 'cursor-pointer text-blue-600 hover:text-blue-700'
                                                            : 'cursor-not-allowed text-gray-400'
                                                            }`}
                                                    >
                                                        Choose files to upload
                                                    </label>
                                                    <p className="mt-1 text-xs text-gray-500">or drag and drop files here</p>
                                                </div>

                                                {hasLocalFiles && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-sm font-semibold text-gray-800">
                                                            Files selected ({localFiles.length}):
                                                        </h5>
                                                        <ul className="space-y-2">
                                                            {localFiles.map((file, index) => (
                                                                <li
                                                                    key={`${file.name}-${index}`}
                                                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                                                                >
                                                                    <span className="truncate pr-4 text-sm text-gray-900">{file.name}</span>
                                                                    {typeof onRemoveLocalFile === 'function' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => onRemoveLocalFile(index)}
                                                                            className="p-1 text-red-600 transition hover:text-red-700"
                                                                            aria-label="Remove selected file"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={onUploadLocalFiles}
                                                                disabled={uploadDisabled || typeof onUploadLocalFiles !== 'function'}
                                                                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                            >
                                                                Upload ({localFiles.length})
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {canRenderMarkComplete && (
                    <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (!markCompleteButtonDisabled) {
                                    onMarkComplete?.(checkpointId);
                                }
                            }}
                            disabled={markCompleteButtonDisabled}
                            title={isMarkCompleteDisabled ? 'Upload at least one file to mark complete' : 'Mark as Complete'}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <CheckCircle size={20} />
                            Mark as Complete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckpointCardModal;
