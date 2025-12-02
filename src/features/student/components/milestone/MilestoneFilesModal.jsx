import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FileText, Loader2, User, X } from 'lucide-react';
import useClickOutside from '../../../../hooks/useClickOutside';
import { useSecureFileHandler } from '../../../../hooks/useSecureFileHandler';
import { patchGenerateNewMilestoneFileLinkByMilestoneIdAndFileId } from '../../../../services/studentApi';
import useIsoToLocalTime from '../../../../hooks/useIsoToLocalTime';
import useFileSizeFormatter from '../../../../hooks/useFileSizeFormatter';

const getFileUrl = (file) => file?.fileUrl || file?.url || null;

const getFileKey = (file) => file?.id ?? null;

const extractUrlLike = (payload) => {
  if (!payload) return null;
  const target = typeof payload === 'object' && payload !== null && 'data' in payload ? payload.data : payload;
  console.log('extractUrlLike target:', target);
  if (typeof target === 'string') return target;
  if (typeof target === 'object' && target !== null) {
    return target.fileUrl || null;
  }
  return null;
};

const MilestoneFilesModal = ({ isOpen, files = [], milestoneId = null, onClose = () => { } }) => {
  const modalRef = useRef(null);
  const [activeFileKey, setActiveFileKey] = useState(null);
  const { openSecureFile } = useSecureFileHandler();
  const { formatIsoString } = useIsoToLocalTime();
  const { formatFileSize } = useFileSizeFormatter();

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useClickOutside(modalRef, handleClose);

  const normalizedFiles = useMemo(() => (Array.isArray(files) ? files : []), [files]);

  const handleOpenFile = useCallback(async (file) => {
    if (!file) return;
    const fallbackUrl = getFileUrl(file);
    const resolvedFileId = file?.id ?? null;
    const shouldRefresh = milestoneId != null && resolvedFileId != null;

    const secureFetcher = async () => {
      if (!shouldRefresh) {
        return fallbackUrl;
      }
      const refreshed = await patchGenerateNewMilestoneFileLinkByMilestoneIdAndFileId(milestoneId, resolvedFileId);
      return extractUrlLike(refreshed) || fallbackUrl;
    };

    const forceRefresh = shouldRefresh || !fallbackUrl;

    const keyForState = getFileKey(file) ?? `file-${Date.now()}`;
    setActiveFileKey(keyForState);

    try {
      await openSecureFile(
        fallbackUrl,
        secureFetcher,
        forceRefresh,
      );
    } finally {
      setActiveFileKey(null);
    }
  }, [milestoneId, openSecureFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100"
      >
        <div className="p-5 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-orangeFpt-500" /> Lecturer Files ({normalizedFiles.length})
          </h4>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-1" aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {normalizedFiles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-6 text-center text-sm text-gray-600">
              No files available.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {normalizedFiles.map((file, index) => {
                const fileKey = getFileKey(file) ?? `file-${index}`;
                const isOpening = activeFileKey === fileKey;
                const formattedCreatedAt = formatIsoString(file?.createAt);
                const sizeLabel = formatFileSize(file?.fileSize);

                return (
                  <li
                    key={fileKey}
                    className="flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenFile(file)}
                      className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-orangeFpt-200 hover:bg-orangeFpt-50"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-500">
                        {isOpening ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-orangeFpt-500 flex items-center gap-2">
                          <span className="truncate" title={file?.name || 'File'}>
                            {file?.name || 'File'}
                          </span>
                          {sizeLabel && (
                            <span className="flex-shrink-0 text-xs text-gray-500">
                              &gt; {sizeLabel}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-2">
                                  Uploaded by {file?.owner || 'Lecturer'} • {formattedCreatedAt}
                              </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-5 border-t flex justify-end">
          <button onClick={handleClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium text-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneFilesModal;
