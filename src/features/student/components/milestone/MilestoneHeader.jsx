import React, { useMemo, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Award, FileText, ChevronDown, ChevronUp, User, Quote, Pencil } from 'lucide-react';
import { getStatusColor, normalizeMilestoneStatus } from '../../../../utils/milestoneHelpers';
import MilestoneFilesModal from './MilestoneFilesModal';
import MilestoneQuestions from './MilestoneQuestions';
import MilestoneReturns from './MilestoneReturns';
import useFileSizeFormatter from '../../../../hooks/useFileSizeFormatter';

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
  onAnswerSubmitted = () => { },
  onUpdateClick,
}) => {
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const { formatFileSize } = useFileSizeFormatter();
  const status = normalizeMilestoneStatus(milestone?.status);
  const isMilestoneCompleted = status === 'Completed';
  const dueDate = milestone?.endDate;
  const startDate = milestone?.startDate ?? null;
  const completedDate = milestone?.completedDate ?? null;
  const lecturerFiles = Array.isArray(milestone?.lecturerFiles) ? milestone.lecturerFiles : [];
  const returns = Array.isArray(milestone?.returns) ? milestone.returns : [];
  const completedAnswers = milestone?.completedAnswers ?? 0;
  const requiredAnswers = milestone?.requiredAnswers ?? milestone?.milestoneQuestionCount ?? 0;
  const resolvedMilestoneId = milestone?.teamMilestoneId ?? milestone?.milestoneId ?? milestone?.id ?? null;

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
        <div className="flex items-center gap-2 self-start">
          {!readOnly && onUpdateClick && (
            <button
              type="button"
              onClick={onUpdateClick}
              className="inline-flex items-center justify-center rounded-full border p-2 transition border-gray-200 text-black hover:border-gray-300 hover:bg-gray-50"
              aria-label="Edit milestone"
            >
              <Pencil size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilesModal(true)}
            className="relative inline-flex flex-shrink-0 items-center justify-center rounded-full border p-2 transition border-gray-200 text-black hover:border-gray-300 hover:bg-gray-50"
            aria-label="View milestone files"
          >
            <FileText size={20} />
            <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full  bg-black px-1 text-[10px] font-semibold leading-none text-white">
              {lecturerFiles.length}
            </span>
          </button>
        </div>
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
          milestoneId={resolvedMilestoneId}
          onClose={() => setShowFilesModal(false)}
        />

        {/* Returns */}
        <MilestoneReturns
          submissions={normalizedReturns}
          canManageReturns={canManageReturns}
          onUploadMilestoneFiles={onUploadMilestoneFiles}
          onDeleteMilestoneReturn={onDeleteMilestoneReturn}
          milestoneId={resolvedMilestoneId}
        />
      </div>
      <div className='p-6 border-t '>
        {/* Evaluation */}
        {milestone.evaluation && (
          <section className="animate-fade-in ">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-4">
              <div className=" bg-orange-100 rounded-lg text-orange-600">
                <Award size={16} strokeWidth={2.5} />
              </div>
              <h4 className="text-sm font-bold text-gray-800">
                Milestone Evaluation
              </h4>
            </div>

            {/* Main Card */}
            <div className="bg-white border border-orange-200 rounded-xl shadow-sm overflow-hidden">

              {/* Top Row: Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 border-b border-orange-100">

                {/* Left: Score (Điểm số - Quan trọng nhất) */}
                <div className="md:col-span-3 bg-orange-50/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-orange-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Score</span>
                  <div className="relative">
                    <span className="text-5xl font-extrabold text-orange-600 tracking-tight">
                      {milestone.evaluation.score}
                    </span>
                  </div>
                </div>

                {/* Right: Metadata  */}
                <div className="md:col-span-9 p-6 flex flex-col justify-center gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Lecturer Info */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-gray-400">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Lecturer</p>
                        <p className="font-semibold text-gray-900 text-base">
                          {milestone.evaluation.lecturer?.name || 'N/A'}
                        </p>
                        {milestone.evaluation.lecturer?.code && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orangeFpt-100 text-orangeFpt-700 text-xs rounded-md font-medium">
                            {milestone.evaluation.lecturer.code}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-gray-400">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Graded Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {milestone.evaluation.createdDate
                            ? new Date(milestone.evaluation.createdDate).toLocaleString('vi-VN', {
                              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                            })
                            : '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Comment Section */}
              {milestone.evaluation.comment && (
                <div className="p-6 bg-white">
                  <div className="flex gap-3">
                    <div className="text-orange-400 mt-1">
                      <Quote size={20} className="rotate-180 fill-current opacity-30" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Lecturer Comment</p>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {milestone.evaluation.comment}
                      </div>
                    </div>
                  </div>
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
