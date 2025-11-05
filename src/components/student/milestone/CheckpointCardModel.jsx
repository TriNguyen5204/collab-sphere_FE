import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Clock, X, AlertCircle, FileText, Loader2, Trash2, History, User, Upload, CheckCircle, RefreshCcw } from 'lucide-react';
import useClickOutside from '../../../hooks/useClickOutside';
import { useTeam } from '../../../context/TeamContext';
import CheckpointAssignMenu from './CheckpointAssignMenu';
import CheckpointEditMenu from './CheckpointEditMenu';

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
        case 'PROCESSING':
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

const toDateInputValue = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        // assume the value is already in YYYY-MM-DD format
        return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    canEdit = false,
    canDelete = false,
    uiStatus,
    localFiles = [],
    onSelectLocalFiles,
    onRemoveLocalFile,
    onUploadLocalFiles,
    uploadDisabled = true,
    onMarkComplete,
    onDeleteSubmission,
    canAssign = false,
    onAssignMembers,
    onGenerateFileLink,
    onUpdateCheckpoint,
    onDeleteCheckpoint,
}) => {
    const modalRef = useRef(null);
    const assignContainerRef = useRef(null);
    const editContainerRef = useRef(null);
    const { team } = useTeam();
    const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const resolvedDetail = detail ?? fallbackCheckpoint ?? {};

    const defaultEditForm = useMemo(() => {
        const base = resolvedDetail ?? {};
        const fallback = fallbackCheckpoint ?? {};
        const title = base.title ?? fallback.title ?? fallbackTitle ?? '';
        const description = base.description ?? fallback.description ?? '';
        const startDate = toDateInputValue(base.startDate ?? fallback.startDate);
        const dueDate = toDateInputValue(
            base.dueDate ?? base.deadline ?? base.endDate ?? fallback.dueDate ?? fallback.deadline ?? fallback.endDate
        );
        const complexity = (base.complexity ?? fallback.complexity ?? 'LOW').toString().toUpperCase();
        return {
            title,
            description,
            startDate,
            dueDate,
            complexity,
        };
    }, [resolvedDetail, fallbackCheckpoint, fallbackTitle]);

    const [editFormState, setEditFormState] = useState(defaultEditForm);

    const assignments = useMemo(() => {
        if (Array.isArray(resolvedDetail?.checkpointAssignments)) {
            return resolvedDetail.checkpointAssignments;
        }
        if (Array.isArray(resolvedDetail?.assignments)) {
            return resolvedDetail.assignments;
        }
        return [];
    }, [resolvedDetail]);

    const checkpointFiles = useMemo(() => {
        if (Array.isArray(resolvedDetail?.checkpointFiles)) {
            return resolvedDetail.checkpointFiles;
        }
        if (Array.isArray(resolvedDetail?.submissions)) {
            return resolvedDetail.submissions;
        }
        return [];
    }, [resolvedDetail]);

    useEffect(() => {
        if (!isEditMenuOpen) {
            setEditFormState(defaultEditForm);
            setEditError(null);
            setIsSavingEdit(false);
        }
    }, [defaultEditForm, isEditMenuOpen]);

    useEffect(() => {
        if (!isOpen) {
            setIsEditMenuOpen(false);
            setIsSavingEdit(false);
            setEditError(null);
        }
    }, [isOpen]);

    const initialAssignedIds = useMemo(() => {
        const ids = assignments
            .map((assignment) => assignment?.classMemberId ?? assignment?.classMemberID ?? assignment?.classmemberId ?? null)
            .filter((id) => id != null);
        return Array.from(new Set(ids));
    }, [assignments]);
    const initialAssignedKey = [...initialAssignedIds]
        .map((value) => String(value))
        .sort()
        .join('|');
    const [selectedMemberIds, setSelectedMemberIds] = useState(initialAssignedIds);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        setSelectedMemberIds((prev) => {
            const prevKey = [...prev]
                .map((value) => String(value))
                .sort()
                .join('|');
            if (prevKey === initialAssignedKey) {
                return prev;
            }
            return initialAssignedIds;
        });
    }, [isOpen, initialAssignedIds, initialAssignedKey]);

    useEffect(() => {
        if (!isOpen) {
            setIsAssignMenuOpen(false);
            setIsEditMenuOpen(false);
            setIsSavingEdit(false);
            setEditError(null);
            setIsDeleting(false);
            setDeleteError(null);
        }
    }, [isOpen]);

    useClickOutside(modalRef, () => {
        if (isOpen) {
            onClose?.();
        }
    });

    useClickOutside(assignContainerRef, () => {
        if (isAssignMenuOpen) {
            setIsAssignMenuOpen(false);
        }
    });

    useClickOutside(editContainerRef, () => {
        if (isEditMenuOpen) {
            setIsEditMenuOpen(false);
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

    const teamMembers = useMemo(() => {
        const members = Array.isArray(team?.memberInfo?.members) ? team.memberInfo.members : [];
        const generateRole = (roleCode, roleLabel) => {
            if (roleCode === 1 || roleLabel?.toString?.().toUpperCase?.() === 'LEADER') {
                return 'Leader';
            }
            return 'Member';
        };

        return members
            .map((member) => ({
                classMemberId: member?.classMemberId ?? member?.classMemberID ?? member?.id ?? null,
                name: member?.fullname ?? member?.fullName ?? member?.studentName ?? member?.name ?? 'Member',
                avatar: member?.avatar ?? member?.avatarImg ?? member?.profileImg ?? null,
                role: generateRole(member?.teamRole, member?.teamRoleString),
            }))
            .filter((member) => member.classMemberId != null);
    }, [team]);

    const normalizedFiles = useMemo(
        () =>
            checkpointFiles.map((file, index) => {
                const resolvedId = file.fileId ?? file.checkpointFileId ?? file.submissionId ?? file.id ?? index;
                return {
                    id: resolvedId,
                    fileId: resolvedId,
                    name: file.originalFileName ?? file.fileName ?? file.name ?? `Attachment ${index + 1}`,
                    url: file.fileUrl ?? file.url ?? file.downloadUrl ?? file.path ?? file.filePath ?? null,
                    uploadedBy: file.uploadedByName ?? file.uploadedBy ?? file.userName ?? file.createdBy ?? '',
                    uploadedAt: file.uploadedAt ?? file.createdAt ?? file.submittedAt ?? file.createdDate ?? '',
                    size: file.fileSize ?? file.size ?? null,
                    raw: file,
                };
            }),
        [checkpointFiles]
    );

    const checkpointId = resolvedDetail?.checkpointId ?? resolvedDetail?.id ?? resolvedDetail?.checkpointID ?? fallbackCheckpoint?.id ?? null;

    const toggleMemberSelection = (memberId) => {
        setSelectedMemberIds((prev) =>
            prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
        );
    };

    const handleToggleAssignMenu = () => {
        if (!canAssign || teamMembers.length === 0) {
            return;
        }
        setIsAssignMenuOpen((open) => !open);
    };

    const handleConfirmAssign = () => {
        if (typeof onAssignMembers === 'function' && checkpointId != null) {
            onAssignMembers(checkpointId, selectedMemberIds);
        }
        setIsAssignMenuOpen(false);
    };

    const handleToggleEditMenu = () => {
        if (!canEdit) {
            return;
        }
        setIsEditMenuOpen((open) => {
            const next = !open;
            if (!open) {
                setEditFormState(defaultEditForm);
                setEditError(null);
            }
            return next;
        });
    };

    const handleCloseEditMenu = () => {
        setIsEditMenuOpen(false);
        setEditError(null);
        setIsSavingEdit(false);
    };

    const handleConfirmEdit = async () => {
        if (!canEdit || checkpointId == null || typeof onUpdateCheckpoint !== 'function') {
            return;
        }

        const trimmedTitle = (editFormState.title ?? '').trim();
        if (!trimmedTitle) {
            setEditError('Title is required.');
            return;
        }

        const dueDateValue = editFormState.dueDate ?? '';
        if (!dueDateValue) {
            setEditError('Due date is required.');
            return;
        }

        const normalizedComplexity = (editFormState.complexity ?? 'LOW').toString().toUpperCase();
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(normalizedComplexity)) {
            setEditError('Complexity must be Low, Medium, or High.');
            return;
        }

        const teamMilestoneCandidates = [
            resolvedDetail?.teamMilestoneId,
            resolvedDetail?.teamMilestoneID,
            resolvedDetail?.milestoneId,
            resolvedDetail?.teamMilestone?.id,
            fallbackCheckpoint?.teamMilestoneId,
            fallbackCheckpoint?.teamMilestoneID,
            fallbackCheckpoint?.milestoneId,
        ];
        const teamMilestoneId = teamMilestoneCandidates.find((value) => value != null);

        if (teamMilestoneId == null) {
            setEditError('Missing team milestone reference.');
            return;
        }

        const payload = {
            teamMilestoneId,
            title: trimmedTitle,
            description: (editFormState.description ?? '').trim(),
            complexity: normalizedComplexity,
            startDate: editFormState.startDate ? editFormState.startDate : null,
            dueDate: dueDateValue,
        };

        setIsSavingEdit(true);
        setEditError(null);

        try {
            await onUpdateCheckpoint(checkpointId, payload);
            setIsEditMenuOpen(false);
        } catch (submitError) {
            const responseData = submitError?.response?.data;
            let message = submitError?.message ?? 'Failed to update checkpoint.';
            if (typeof responseData === 'string') {
                message = responseData;
            } else if (responseData && typeof responseData === 'object' && responseData.message) {
                message = responseData.message;
            } else if (Array.isArray(responseData) && responseData.length > 0) {
                message = responseData[0]?.message ?? message;
            }
            setEditError(message);
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (readOnly || !canDelete || checkpointId == null || typeof onDeleteCheckpoint !== 'function') {
            return;
        }

        const confirmed = window.confirm('Are you sure you want to delete this checkpoint?');
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await onDeleteCheckpoint(checkpointId);
            setIsDeleting(false);
            onClose?.();
        } catch (deleteErr) {
            const responseData = deleteErr?.response?.data;
            let message = deleteErr?.message ?? 'Failed to delete checkpoint.';

            if (typeof responseData === 'string') {
                message = responseData;
            } else if (responseData && typeof responseData === 'object' && responseData.message) {
                message = responseData.message;
            } else if (Array.isArray(responseData) && responseData.length > 0) {
                const nestedMessage = responseData
                    .map((entry) => (typeof entry === 'string' ? entry : entry?.message))
                    .filter(Boolean)
                    .join('\n');
                if (nestedMessage) {
                    message = nestedMessage;
                }
            }

            setIsDeleting(false);
            setDeleteError(message);
        }
    };

    if (!isOpen) {
        return null;
    }

    const statusRaw = resolvedDetail?.statusString ?? resolvedDetail?.status ?? fallbackCheckpoint?.statusString ?? fallbackCheckpoint?.status ?? '';
    const statusForBadge = typeof statusRaw === 'string' ? statusRaw : statusRaw?.toString?.() ?? '';
    const normalizedStatus = statusForBadge
        ? statusForBadge.toString().replace(/_/g, ' ')
        : '';
    const complexity = resolvedDetail?.complexity ?? fallbackCheckpoint?.complexity ?? '';
    const description = resolvedDetail?.description ?? fallbackCheckpoint?.description ?? '';
    const startDate = resolvedDetail?.startDate ?? fallbackCheckpoint?.startDate ?? null;
    const dueDate = resolvedDetail?.dueDate ?? resolvedDetail?.deadline ?? resolvedDetail?.endDate ?? fallbackCheckpoint?.dueDate ?? null;
    const submissionsCount = normalizedFiles.length;
    const assignmentsCount = assignments.length;
    const lacksAssignments = assignmentsCount === 0;
    const lacksSubmissions = submissionsCount === 0;
    const markCompleteDisabledTitle = lacksAssignments
        ? 'Assign members before marking this checkpoint complete'
        : lacksSubmissions
            ? 'Upload at least one file to mark complete'
            : 'Mark as Complete';
    const markCompleteRequirementMissing = lacksAssignments || lacksSubmissions;
    const hasLocalFiles = Array.isArray(localFiles) && localFiles.length > 0;
    const canShowUpload = canUpload && !readOnly;
    const canRenderMarkComplete = (uiStatus ?? '').toString().toLowerCase() !== 'completed' && !readOnly;
    const fileInputId = checkpointId ? `cp-file-input-${checkpointId}` : 'cp-file-input';
    const markCompleteButtonDisabled = markCompleteRequirementMissing || typeof onMarkComplete !== 'function' || checkpointId == null;
    const hasResolvedData = detail != null || fallbackCheckpoint != null;
    const deleteDisabled = !canDelete || readOnly || typeof onDeleteCheckpoint !== 'function' || checkpointId == null || isDeleting;
    const deleteButtonTitle = isDeleting
        ? 'Deleting checkpoint...'
        : !canDelete || readOnly
            ? 'Deletion locked'
            : 'Delete checkpoint';

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
                            <CheckpointAssignMenu
                                ref={assignContainerRef}
                                isOpen={isAssignMenuOpen}
                                canAssign={canAssign}
                                onToggleMenu={handleToggleAssignMenu}
                                onConfirm={handleConfirmAssign}
                                teamMembers={teamMembers}
                                selectedMemberIds={selectedMemberIds}
                                onToggleMember={toggleMemberSelection}
                            />
                            <CheckpointEditMenu
                                ref={editContainerRef}
                                isOpen={isEditMenuOpen}
                                canEdit={canEdit && !readOnly}
                                onToggleMenu={handleToggleEditMenu}
                                onCloseMenu={handleCloseEditMenu}
                                formState={editFormState}
                                onChange={setEditFormState}
                                onSubmit={handleConfirmEdit}
                                isSubmitting={isSavingEdit}
                                errorMessage={editError}
                            />
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteDisabled}
                                title={deleteButtonTitle}
                                className={`p-2 rounded-lg transition ${
                                    deleteDisabled
                                        ? 'cursor-not-allowed text-gray-400'
                                        : 'text-red-600 hover:bg-red-50'
                                }`}
                                aria-label="Delete checkpoint"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
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

                    {!isLoading && deleteError && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5" />
                            <div>
                                <p>{deleteError}</p>
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
                                                            {typeof onGenerateFileLink === 'function' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => checkpointId != null && onGenerateFileLink(checkpointId, file.fileId ?? file.id)}
                                                                    className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-sm text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
                                                                >
                                                                    <RefreshCcw size={16} />
                                                                    Refresh link
                                                                </button>
                                                            )}
                                                            {!readOnly && typeof onDeleteSubmission === 'function' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => checkpointId != null && onDeleteSubmission?.(checkpointId, file.fileId ?? file.id)}
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
                            title={markCompleteDisabledTitle}
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
