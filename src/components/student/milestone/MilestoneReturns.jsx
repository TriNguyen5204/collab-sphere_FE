import React, { useMemo, useState } from 'react';
import { Upload, FileText, Trash2, Loader2, User, X } from 'lucide-react';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;
const LINK_REFRESH_BUFFER_MS = 60 * 1000; // Refresh link if it will expire within the next minute

const timezoneRegex = /([zZ])|([+-]\d{2}:?\d{2})$/;

const normalizeUtcString = (rawValue) => {
  if (typeof rawValue !== 'string') return null;
  let value = rawValue.trim();

  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00Z`;
  }

  if (value.includes(' ')) {
    value = value.replace(' ', 'T');
  }

  if (!timezoneRegex.test(value)) {
    value = value.endsWith('Z') ? value : `${value}Z`;
  }

  return value;
};

const parseUtcDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const normalized = normalizeUtcString(value);
    if (!normalized) return null;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const vietnamFormatter = (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function')
  ? new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  : null;

const formatVietnamTimeLabel = (utcDate) => {
  if (!utcDate) return '';
  if (vietnamFormatter) {
    return vietnamFormatter.format(utcDate);
  }
  const fallback = new Date(utcDate.getTime() + VIETNAM_UTC_OFFSET_MS);
  return fallback.toLocaleString('vi-VN');
};

const buildExpireInfo = (rawExpireTime) => {
  const expireDateUtc = parseUtcDate(rawExpireTime);

  if (!expireDateUtc) {
    return {
      expireDateUtc: null,
      expireLabel: '',
      isExpired: false,
      shouldRefresh: true,
    };
  }

  const expireMs = expireDateUtc.getTime();
  const nowMs = Date.now();

  return {
    expireDateUtc,
    expireLabel: formatVietnamTimeLabel(expireDateUtc),
    isExpired: nowMs >= expireMs,
    shouldRefresh: (nowMs + LINK_REFRESH_BUFFER_MS) >= expireMs,
  };
};

const MilestoneReturns = ({
  submissions = [],
  canManageReturns = false,
  onUploadMilestoneFiles = () => { },
  onDeleteMilestoneReturn,
  onRefreshMilestoneReturnLink,
}) => {
  const [localFiles, setLocalFiles] = useState([]);
  const [isUploadingReturns, setIsUploadingReturns] = useState(false);
  const [refreshingReturnId, setRefreshingReturnId] = useState(null);

  const submissionsWithExpireInfo = useMemo(() => (
    submissions.map((submission) => ({
      ...submission,
      expireInfo: buildExpireInfo(
        submission?.urlExpireTime
        ?? submission?.urlExpireAt
        ?? submission?.expireTime
        ?? submission?.expiredAt
        ?? submission?.linkExpiredAt
      ),
    }))
  ), [submissions]);

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

  const handleOpenReturn = async (returnItem) => {
    if (!returnItem) return;
    const { id } = returnItem;

    const currentSubmission = (id != null
      ? submissionsWithExpireInfo.find((item) => item.id === id)
      : null) || returnItem;

    const fallbackUrl = currentSubmission?.url
      ?? submissions.find((item) => item.id === id)?.url
      ?? returnItem.url
      ?? returnItem.path;

    const SAFE_BUFFER = 5 * 60 * 1000;
    const expireInfo = currentSubmission?.expireInfo
      ?? buildExpireInfo(currentSubmission?.urlExpireTime || returnItem?.urlExpireTime);

    const isRiskOfExpiring = expireInfo?.expireDateUtc
      ? (Date.now() + SAFE_BUFFER) >= expireInfo.expireDateUtc.getTime()
      : true;

    const canRefresh = typeof onRefreshMilestoneReturnLink === 'function' && id != null;
    const shouldFetchNew = canRefresh && (isRiskOfExpiring || !fallbackUrl);

    if (!shouldFetchNew) {
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('Please allow pop-ups for this website to view the file.');
      return;
    }

    newWindow.document.write(`
      <html>
        <head><title>Loading Document...</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f9fafb;">
          <div style="text-align:center;">
            <div style="margin-bottom:10px;">
                <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            </div>
            <p style="color:#374151;">Generating secure link...</p>
          </div>
          <script>
            const svg = document.querySelector('svg');
            let deg = 0;
            setInterval(() => { deg = (deg + 6) % 360; svg.style.transform = 'rotate(' + deg + 'deg)'; }, 16);
          </script>
        </body>
      </html>
    `);

    try {
      setRefreshingReturnId(id);
      console.info(`Refreshing submission link for return ${id}`);
      const refreshedUrl = await onRefreshMilestoneReturnLink(id);
      const sanitizedRefreshedUrl = typeof refreshedUrl === 'string' ? refreshedUrl.trim() : '';
      const finalUrl = sanitizedRefreshedUrl || fallbackUrl;

      if (finalUrl) {
        newWindow.location.href = finalUrl;
      } else {
        newWindow.document.body.innerHTML = '<p style="text-align:center;color:red;">Could not load document URL.</p>';
      }
    } catch (error) {
      console.error('Failed to refresh submission link', error);
      if (fallbackUrl) {
        newWindow.location.href = fallbackUrl;
      } else {
        newWindow.close();
        alert('Failed to open document.');
      }
    } finally {
      setRefreshingReturnId(null);
    }
  };

  return (
    <section>
      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <Upload size={16} />
        Submissions ({submissions.length})
      </h4>
      {submissionsWithExpireInfo.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
          {submissionsWithExpireInfo.map((item) => (
            <li
              key={item.id}
              className="flex h-full items-center gap-3 rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex-1 space-y-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleOpenReturn(item)}
                  className="flex w-full min-w-0 items-start gap-3 rounded-md border border-transparent bg-gray-50 p-3 text-left transition hover:border-orangeFpt-200 hover:bg-orangeFpt-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orangeFpt-100 text-orangeFpt-500">
                    {refreshingReturnId === item.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-orangeFpt-500 overflow-hidden text-ellipsis whitespace-nowrap"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                      {item.submittedAtLabel && (
                        <span className="flex items-center gap-2">
                          Submitted by
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={`${item.studentName || 'Student'} avatar`}
                              className="h-5 w-5 flex-shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                              <User size={20} />
                            </div>
                          )}
                          {item.studentName || 'Unknown student'} at {item.submittedAtLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              {typeof onDeleteMilestoneReturn === 'function' && canManageReturns && (
                <button
                  type="button"
                  onClick={() => onDeleteMilestoneReturn(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 hover:text-red-700"
                  aria-label="Delete submission"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-6 text-center text-sm text-gray-600">
          No submissions yet. Upload your first file to get started.
        </div>
      )}

      {canManageReturns && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <Upload className="mx-auto mb-3 text-gray-400" size={32} />
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              id="mile-file-input"
              className="hidden"
              disabled={isUploadingReturns}
            />
            <label
              htmlFor="mile-file-input"
              className={`font-semibold ${isUploadingReturns ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer text-orangeFpt-500 hover:text-orangeFpt-600'}`}
            >
              Choose files to upload
            </label>
            <p className="mt-1 text-xs text-gray-500">or drag and drop files here</p>
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
                      <Loader2 className="h-4 w-4 animate-spin text-orangeFpt-500" />
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