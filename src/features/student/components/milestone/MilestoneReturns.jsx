import React, { useCallback, useMemo, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, Loader2, User, X, ChevronRight, UploadCloud } from 'lucide-react';
import { useSecureFileHandler } from '../../../../hooks/useSecureFileHandler';
import useIsoToLocalTime from '../../../../hooks/useIsoToLocalTime';
import { patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId } from '../../../../services/studentApi';
import useFileSizeFormatter from '../../../../hooks/useFileSizeFormatter';
import useToastConfirmation from '../../../../hooks/useToastConfirmation.jsx';

const getReturnFileUrl = (submission) => submission?.url || submission?.fileUrl || submission?.path || null;

const getReturnKey = (submission) => submission?.id ?? submission?.mileReturnId ?? null;

const extractUrlLike = (payload) => {
  if (!payload) return null;
  const target = typeof payload === 'object' && payload !== null && 'data' in payload ? payload.data : payload;
  if (typeof target === 'string') return target;
  if (typeof target === 'object' && target !== null) {
    return target.fileUrl || target.url || target.path || null;
  }
  return null;
};

const MilestoneReturns = ({
  milestone,
  submissions = [],
  canManageReturns = false,
  onUploadMilestoneFiles = () => { },
  onDeleteMilestoneReturn,
  milestoneId = null,
}) => {
  const [localFiles, setLocalFiles] = useState([]);
  const [isUploadingReturns, setIsUploadingReturns] = useState(false);
  const [activeReturnKey, setActiveReturnKey] = useState(null);
  const [deletingReturnId, setDeletingReturnId] = useState(null);
  const { openSecureFile } = useSecureFileHandler();
  const { formatIsoString } = useIsoToLocalTime();
  const { formatFileSize } = useFileSizeFormatter();
  const confirmWithToast = useToastConfirmation();
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      handleFileSelect(syntheticEvent);
    }
  };

  const normalizedSubmissions = useMemo(() => (
    (Array.isArray(submissions) ? submissions : []).map((submission, index) => {
      const fileKey = getReturnKey(submission) ?? `return-${index}`;
      const fileSize = typeof submission.size === 'number' ? submission.size : submission.fileSize;
      const submittedAtSource = submission.submittedAt
        ?? submission.submittedDate
        ?? submission.submitedDate
        ?? submission.createdAt
        ?? submission.createdDate
        ?? submission.submittedAtLabel
        ?? null;

      return {
        ...submission,
        _fileKey: fileKey,
        sizeLabel: formatFileSize(fileSize),
        submittedAtLabel: formatIsoString(submittedAtSource),
      };
    })
  ), [submissions, formatIsoString]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    if (isUploadingReturns) return;
    setLocalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (isUploadingReturns || localFiles.length === 0) return;
    if (typeof onUploadMilestoneFiles !== 'function') return;

    try {
      setIsUploadingReturns(true);
      await onUploadMilestoneFiles(localFiles);
      setLocalFiles([]);
    } catch (error) {
      console.error('Failed to upload milestone submissions', error);
    } finally {
      setIsUploadingReturns(false);
    }
  };

  const handleOpenReturn = useCallback(async (returnItem) => {
    if (!returnItem) return;
    const fallbackUrl = getReturnFileUrl(returnItem);
    const resolvedReturnId = returnItem?.id ?? null;
    const shouldRefresh = milestoneId != null && resolvedReturnId != null;

    if (!fallbackUrl && !shouldRefresh) {
      toast.error('No document link available.');
      return;
    }

    const secureFetcher = async () => {
      if (!shouldRefresh) {
        return fallbackUrl;
      }
      const refreshed = await patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId(
        milestoneId,
        resolvedReturnId,
      );
      return extractUrlLike(refreshed) || fallbackUrl;
    };

    const forceRefresh = shouldRefresh || !fallbackUrl;
    const keyForState = getReturnKey(returnItem) ?? `return-${Date.now()}`;
    setActiveReturnKey(keyForState);

    try {
      await openSecureFile(
        fallbackUrl,
        secureFetcher,
        forceRefresh,
      );
    } catch (error) {
      console.error('Failed to open milestone submission', error);
    } finally {
      setActiveReturnKey(null);
    }
  }, [milestoneId, openSecureFile]);

  const handleDeleteReturn = useCallback(async (returnItem) => {
    if (!returnItem || typeof onDeleteMilestoneReturn !== 'function') return;
    const resolvedId = returnItem.id ?? returnItem.mileReturnId ?? null;
    if (resolvedId == null) return;

    const confirmed = await confirmWithToast({
      message: `Delete ${returnItem.name || 'this submission'}? This action cannot be undone.`,
      confirmLabel: 'Delete file',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      setDeletingReturnId(resolvedId);
      await onDeleteMilestoneReturn(resolvedId);
    } catch (error) {
      console.error('Failed to delete milestone submission', error);
    } finally {
      setDeletingReturnId(null);
    }
  }, [confirmWithToast, onDeleteMilestoneReturn]);

  return (
    <section>
      {normalizedSubmissions.length > 0 ? (
        <div className='border-t space-y-4 p-6'>
          <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Submissions ({normalizedSubmissions.length})
          </h4>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 max-h-56 overflow-y-auto customscroll pr-1">
            {normalizedSubmissions.map((item) => {
              const fileKey = item._fileKey;
              const isOpening = activeReturnKey === fileKey;

              return (
                <li
                  key={fileKey}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-white hover:bg-orangeFpt-100 p-3 shadow-sm transition-opacity"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenReturn(item)}
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-500">
                      {isOpening ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={'truncate text-sm font-semibold max-w-[25rem] text-orangeFpt-500'}>{item.name}</p>
                        <span className="text-xs font-medium text-gray-400">{item.sizeLabel}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.studentName || 'Student'} • {item.submittedAtLabel}</p>
                    </div>
                  </button>
                  {typeof onDeleteMilestoneReturn === 'function' && canManageReturns && (
                    <div className="flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => handleDeleteReturn(item)}
                        className="inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-100 disabled:opacity-60"
                        aria-label="Delete submission"
                        disabled={deletingReturnId === item.id}
                      >
                        {deletingReturnId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                </li>
              );
            })}
          </ul>
        </div>
      ) : (milestone.status === 'Completed' ? (null) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-6 text-center text-sm text-gray-600">
          No submissions yet. Upload your first file to get started.
        </div>
      )
      )}

      {canManageReturns && (
        <div className="mt-4 border-t border-gray-200 space-y-4 p-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="group relative border-2 border-dashed border-slate-300/60 rounded-2xl p-6 text-center cursor-pointer hover:border-orangeFpt-400/60 hover:bg-orangeFpt-50/30 transition-all duration-300 bg-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/80 text-slate-400 mx-auto flex items-center justify-center mb-3 group-hover:text-orangeFpt-500 group-hover:scale-110 transition-all duration-300">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 group-hover:text-orangeFpt-600 transition-colors">Click to browse</p>
              <p className="text-xs text-slate-400 mt-1">or drag and drop files here</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              id="mile-file-input"
              className="hidden"
              disabled={isUploadingReturns}
            />
          </div>

          {localFiles.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Files selected ({localFiles.length}):</h5>
              <ul className="flex gap-3 w-full flex-wrap">
                {localFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg bg-gray-200 p-3">
                    <span className="truncate pr-3 text-sm text-gray-900">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 text-red-600 transition hover:text-red-700 disabled:text-gray-400"
                      aria-label="remove file"
                      disabled={isUploadingReturns}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploadingReturns || localFiles.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-4 py-2 font-semibold text-white transition hover:bg-orangeFpt-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUploadingReturns ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload ({localFiles.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default MilestoneReturns;
