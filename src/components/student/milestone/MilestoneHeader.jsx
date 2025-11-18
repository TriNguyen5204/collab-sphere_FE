import React, { useMemo, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { getStatusColor, normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import MilestoneFilesModal from './MilestoneFilesModal';
import MilestoneQuestions from './MilestoneQuestions';
import MilestoneReturns from './MilestoneReturns';

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
  const status = normalizeMilestoneStatus(milestone?.status);
  const isMilestoneCompleted = status === 'Completed';
  const dueDate = milestone?.endDate;
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
      const rawExpireTime = r.urlExpireTime ?? r.expireTime ?? r.expiredAt ?? '';
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
        urlExpireTime: rawExpireTime,
      };
    })
  ), [returns]);
  const canManageReturns = !readOnly && !hasEvaluation;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{milestone.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(milestone.status)}`}>
              {milestone.status}
            </span>
          </div>
          <p className="text-gray-600">{milestone.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilesModal(true)}
          className="relative inline-flex flex-shrink-0 items-center justify-center self-start rounded-full border p-2 transition border-gray-200 text-black hover:border-gray-300 hover:bg-gray-50"
          aria-label="View milestone files"
        >
          <FileText size={20} />
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full  bg-black px-1 text-[10px] font-semibold leading-none text-white">
            {lecturerFiles.length}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t md:grid-cols-3 p-6">
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

      <div className="border-t space-y-4 p-6">
        <MilestoneFilesModal
          isOpen={showFilesModal}
          files={lecturerFiles}
          onClose={() => setShowFilesModal(false)}
        />

        {/* Returns */}
        <MilestoneReturns
          submissions={normalizedReturns}
          canManageReturns={canManageReturns}
          onUploadMilestoneFiles={onUploadMilestoneFiles}
          onDeleteMilestoneReturn={onDeleteMilestoneReturn}
          onRefreshMilestoneReturnLink={onRefreshMilestoneReturnLink}
        />

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
        <div className="mt-4 pt-4 border-t p-6">
          <button
            onClick={onComplete}
            disabled={(completedAnswers < requiredAnswers) || isMilestoneCompleted}
            title={
              completedAnswers < requiredAnswers
                ? 'Answer all questions before completing this milestone'
                : (isMilestoneCompleted ? 'This milestone has already been marked as completed' : undefined)
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
          {!(completedAnswers < requiredAnswers) && isMilestoneCompleted && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              This milestone has already been marked as completed
            </p>
          )}
        </div>
      )}

      {/* Questions */}
      <section className="p-4 border-t">
        <button
          type="button"
          onClick={() => canToggleQuestions && setShowQuestions((v) => !v)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded ${canToggleQuestions ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
        >
          <span className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} />
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