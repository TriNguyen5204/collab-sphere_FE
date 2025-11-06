import React, { useMemo, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Upload, Award, Download, FileText, ChevronDown, X, ChevronUp, Trash2, RefreshCcw, Loader2, User } from 'lucide-react';
import { getStatusColor, normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import MilestoneFilesModal from './MilestoneFilesModal';
import MilestoneQuestions from './MilestoneQuestions';

const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision = size < 10 && unitIndex > 0 ? 1 : 0;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const formatSubmittedAt = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString();
};

const MilestoneHeader = ({
  milestone,
  onComplete,
  readOnly = false,
  onUploadMilestoneFiles = () => { },
  onDeleteMilestoneReturn = () => { },
  onRefreshMilestoneReturnLink = () => { },
  onAnswerSubmitted = () => { },
}) => {
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [isUploadingReturns, setIsUploadingReturns] = useState(false);

  const status = normalizeMilestoneStatus(milestone?.statusString ?? milestone?.status);
  const progress = Math.round(milestone?.progress ?? 0);
  const dueDate = milestone?.dueDate ?? milestone?.endDate ?? null;
  const startDate = milestone?.startDate ?? null;
  const completedDate = milestone?.completedDate ?? null;
  const lecturerFiles = Array.isArray(milestone?.lecturerFiles) ? milestone.lecturerFiles : [];
  const returns = Array.isArray(milestone?.returns) ? milestone.returns : [];
  const completedAnswers = milestone?.completedAnswers ?? 0;
  const requiredAnswers = milestone?.requiredAnswers ?? milestone?.milestoneQuestionCount ?? 0;

  const questionCount = useMemo(() => Array.isArray(milestone?.questions) ? milestone.questions.length : 0, [milestone]);
  const canToggleQuestions = questionCount > 0;
  const hasEvaluation = !!milestone?.evaluation;
  const normalizedReturns = useMemo(() => (
    returns.map((r, index) => {
      const resolvedId = r.id ?? r.mileReturnId ?? r.mileReturnID ?? index;
      const rawPath = r.path ?? '';
      const rawUrl = r.fileUrl ?? r.file_url ?? r.url ?? '';
      const fileUrl = rawUrl || rawPath;
      const fileName = r.fileName ?? r.originalFileName ?? r.name ?? (rawPath ? rawPath.split('/').pop() : null);
      const submittedAt = r.submitedDate ?? r.submittedDate ?? r.submittedAt ?? r.createdDate ?? r.createdAt ?? r.submittedAtLabel ?? '';
      const nestedStudentName = r.student?.name ?? r.student?.fullName ?? r.student?.fullname ?? '';
      const fallbackStudentName = r.studentName ?? r.fullname ?? r.fullName ?? '';
      const nestedStudentCode = r.student?.code ?? r.student?.studentCode ?? '';
      const fallbackStudentCode = r.studentCode ?? '';
      const nestedAvatar = r.student?.avatar ?? r.student?.avatarImg ?? '';
      const fallbackAvatar = r.avatarImg ?? r.studentAvatar ?? '';
      const resolvedStudentName = (nestedStudentName || fallbackStudentName || '').trim();
      const resolvedStudentCode = (nestedStudentCode || fallbackStudentCode || '').trim();
      const resolvedAvatar = nestedAvatar || fallbackAvatar;
      const fileSize = typeof r.fileSize === 'number' ? r.fileSize : null;
      const sizeLabel = formatFileSize(fileSize);
      const metaLabel = [r.type ?? '', sizeLabel].filter(Boolean).join(' • ');
      return {
        id: resolvedId,
        name: fileName || r.type || `Submission ${index + 1}`,
        url: fileUrl,
        type: r.type ?? '',
        size: fileSize,
        sizeLabel,
        metaLabel,
        submittedAt,
        submittedAtLabel: formatSubmittedAt(submittedAt),
        studentName: resolvedStudentName,
        studentCode: resolvedStudentCode,
        avatar: resolvedAvatar,
      };
    })
  ), [returns]);
  const canManageReturns = !readOnly && !hasEvaluation;

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
    if (isUploadingReturns) return;
    if (localFiles.length === 0) return;
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

  const hasMilestoneSubmission = normalizedReturns.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{milestone.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
              {status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">{milestone.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600 mb-1">Start Date</p>
          <p className="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            {startDate ? new Date(startDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Due Date</p>
          <p className="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            {dueDate ? new Date(dueDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Questions Completed</p>
          <p className="font-semibold flex items-center gap-2">
            <MessageSquare size={16} />
            {completedAnswers} / {requiredAnswers}
          </p>
        </div>
        <div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Files</p>

          </div>
          <button
            type="button"
            onClick={() => setShowFilesModal(true)}
            className="font-semibold flex items-center gap-2"
          >
            <FileText size={16} />
            {lecturerFiles.length} - <span className='underline'>View</span>
          </button>
        </div>
  {status === 'completed' && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Date</p>
              <p className="font-semibold text-green-600">
                {completedDate ? new Date(completedDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress Overview */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${progress < 30 ? 'bg-red-500' :
                progress < 70 ? 'bg-yellow-500' :
                  'bg-green-500'
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t space-y-4">
        <MilestoneFilesModal
          isOpen={showFilesModal}
          files={lecturerFiles}
          onClose={() => setShowFilesModal(false)}
        />

        {/* Returns */}
        <section>
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Submissions ({normalizedReturns.length})
          </h4>
          {normalizedReturns.length > 0 ? (
            <ul className="space-y-3">
              {normalizedReturns.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={`${item.studentName || 'Student'} avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                          <User size={20} />
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.studentName || 'Unknown student'}
                        </p>
                        {item.studentCode && (
                          <p className="text-xs text-gray-500">Code: {item.studentCode}</p>
                        )}
                        {item.submittedAtLabel && (
                          <p className="text-xs text-gray-500">Submitted {item.submittedAtLabel}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 break-words">{item.name}</p>
                        
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        <Download size={16} />
                        View
                      </a>
                    )}
                    {typeof onRefreshMilestoneReturnLink === 'function' && canManageReturns && (
                      <button
                        type="button"
                        onClick={() => onRefreshMilestoneReturnLink(item.id)}
                        className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-sm text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
                      >
                        <RefreshCcw size={16} />
                        Refresh link
                      </button>
                    )}
                    {typeof onDeleteMilestoneReturn === 'function' && canManageReturns && (
                      <button
                        type="button"
                        onClick={() => onDeleteMilestoneReturn(item.id)}
                        className="text-red-600 transition hover:text-red-700"
                        aria-label="Delete submission"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
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
                  className={`font-semibold ${isUploadingReturns ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer text-blue-600 hover:text-blue-700'}`}
                >
                  Choose files to upload
                </label>
                <p className="mt-1 text-xs text-gray-500">or drag and drop files here</p>
              </div>

              {localFiles.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Files selected ({localFiles.length}):</h5>
                  <ul className="space-y-2">
                    {localFiles.map((file, idx) => (
                      <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
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
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUploadingReturns ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
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

        {/* Evaluation */}
        {milestone.evaluation && (
          <section className='mt-6 pt-6 border-t'>
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Award size={16} />
              Evaluation
            </h4>
            <div className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600">Score</p>
                  <p className="text-sm font-bold text-green-700">{milestone.evaluation.score}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Lecturer</p>
                  <p className="text-sm font-semibold">{milestone.evaluation.lecturer?.name} {milestone.evaluation.lecturer?.code ? `(${milestone.evaluation.lecturer.code})` : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="text-sm">{milestone.evaluation.createdDate ? new Date(milestone.evaluation.createdDate).toLocaleString() : ''}</p>
                </div>
              </div>
              {milestone.evaluation.comment && (
                <div className="mt-1">
                  <p className="text-xs text-gray-600">Comment</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{milestone.evaluation.comment}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>


      {/* Complete Milestone Button */}
      {!hasEvaluation && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onComplete}
            disabled={(completedAnswers < requiredAnswers) || !hasMilestoneSubmission}
            title={
              completedAnswers < requiredAnswers
                ? 'Answer all questions before completing this milestone'
                : (!hasMilestoneSubmission ? 'Upload at least one file to the milestone before marking as complete' : undefined)
            }
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            <CheckCircle size={20} />
            Mark Milestone as Complete
          </button>
          {(completedAnswers < requiredAnswers) && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Answer all questions before completing this milestone
            </p>
          )}
          {!(completedAnswers < requiredAnswers) && !hasMilestoneSubmission && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Upload at least one file to the milestone before marking as complete
            </p>
          )}
        </div>
      )}

      {/* Questions */}
        <section className="mt-6 pt-6 border-t">
          <button
            type="button"
            onClick={() => canToggleQuestions && setShowQuestions((v) => !v)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded ${canToggleQuestions ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
          >
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} />
              Milestone Questions ({questionCount})
            </span>
            {canToggleQuestions && (showQuestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
          </button>
          {showQuestions && canToggleQuestions && (
            <div className="mt-3">
              <MilestoneQuestions
                milestone={milestone}
                milestoneStatus={status}
                readOnly={readOnly}
                onAnswerSubmitted={onAnswerSubmitted}
              />
            </div>
          )}
        </section>
    </div>
  );
};

export default MilestoneHeader;