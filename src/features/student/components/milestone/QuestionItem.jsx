import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, Loader2, MessageCircle, PenLine } from 'lucide-react';
import QuestionAnswers from './QuestionAnswers';
import { useAvatar } from '../../../../hooks/useAvatar';

const autoResizeTextarea = (element) => {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};

const buildInitials = (value) => {
  if (!value || typeof value !== 'string') return 'YOU';
  const parts = value.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('');
  return initials || 'YOU';
};

const QuestionItem = ({
  question,
  index,
  milestoneStatus,
  readOnly = false,
  draftValue = '',
  onDraftChange,
  onSubmit,
  answers = [],
  answerCount = 0,
  isLoading = false,
  isSubmitting = false,
  errorMessage = null,
  currentUserId = null,
  onRateAnswer,
  onEditAnswer,
  onDeleteAnswer,
  answerActionMap = {},
  isAnswerSectionOpen: controlledAnswerSectionOpen,
  onAnswerSectionOpenChange,
  isFormOpen: controlledFormOpen,
  onFormOpenChange,
  persistedExpandedEvaluations,
  onPersistedExpandedEvaluationsChange,
}) => {
  const currentUser = useSelector((state) => state.user || {});
  const canInteract =
    !readOnly &&
    milestoneStatus !== 'completed' &&
    milestoneStatus !== 'locked';

  const answerTextareaRef = useRef(null);
  const [internalAnswerSectionOpen, setInternalAnswerSectionOpen] = useState(false);
  const [internalFormOpen, setInternalFormOpen] = useState(false);

  const isAnswerSectionOpen =
    typeof controlledAnswerSectionOpen === 'boolean'
      ? controlledAnswerSectionOpen
      : internalAnswerSectionOpen;

  const isFormOpen =
    typeof controlledFormOpen === 'boolean' ? controlledFormOpen : internalFormOpen;

  const isQuestionLocked = milestoneStatus === 'locked';

  const canSubmitAnswer = canInteract && !isQuestionLocked;

  const handleDraftChange = (value) => {
    onDraftChange?.(value);
    autoResizeTextarea(answerTextareaRef.current);
  };

  useEffect(() => {
    autoResizeTextarea(answerTextareaRef.current);
  }, [draftValue]);

  const toggleAnswerSection = () => {
    const next = !isAnswerSectionOpen;
    if (typeof onAnswerSectionOpenChange === 'function') {
      onAnswerSectionOpenChange(next);
    } else {
      setInternalAnswerSectionOpen(next);
    }
  };

  const toggleFormSection = () => {
    const next = !isFormOpen;
    if (typeof onFormOpenChange === 'function') {
      onFormOpenChange(next);
    } else {
      setInternalFormOpen(next);
    }
  };

  const answerSummary = useMemo(() => {
    if (typeof answerCount === 'number' && answerCount > 0) {
      return `${answerCount} ${answerCount === 1 ? 'answer' : 'answers'}`;
    }
    if (answers.length === 0) {
      return 'There is no answers yet.';
    }
    return `${answers.length} ${answers.length === 1 ? 'answer' : 'answers'}`;
  }, [answerCount, answers.length]);

  const answerListIsEmpty = !isLoading && answers.length === 0;
  const totalAnswers = typeof answerCount === 'number' && answerCount > 0 ? answerCount : answers.length;
  const answerToggleLabel = isAnswerSectionOpen
    ? 'Hide Answers'
    : totalAnswers > 0
      ? `Show ${totalAnswers} ${totalAnswers === 1 ? 'Answer' : 'Answers'}`
      : 'Show Answers';

  const responderName = currentUser?.fullName || 'You';
  const responderAvatar = currentUser?.avatar || null;
  const { initials: responderInitials, colorClass: responderColorClass, shouldShowImage, setImageError } = useAvatar(responderName, responderAvatar);

  // Check if current user has already answered this question
  const userHasAnswered = useMemo(() => {
    if (!currentUserId || !Array.isArray(answers)) return false;
    return answers.some((answer) => 
      answer.authorId && String(answer.authorId) === String(currentUserId)
    );
  }, [currentUserId, answers]);

  const showAnswerForm = canSubmitAnswer && isFormOpen && !userHasAnswered;

  const renderInput = () => {
    if (!canSubmitAnswer) {
      return null;
    }

    const type = (question?.type || '').toLowerCase();

    if (type === 'boolean') {
      return (
        <select
          value={draftValue}
          onChange={(e) => onDraftChange?.(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    if (type === 'number') {
      return (
        <input
          type="number"
          value={draftValue}
          onChange={(e) => onDraftChange?.(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Enter a number..."
        />
      );
    }

    return (
      <textarea
        ref={answerTextareaRef}
        value={draftValue}
        onChange={(e) => handleDraftChange(e.target.value)}
        onInput={(event) => autoResizeTextarea(event.currentTarget)}
        placeholder="Write your answer here..."
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-200"
      />
    );
  };

  const renderedInput = renderInput();
  const showAnsweredBadge = answerCount > 0;
  const questionCode =
    question?.questionCode ?? question?.code ?? question?.milestoneQuestionCode ?? null;
  const questionText = question?.question || null;
  const questionBadgeLabel = questionCode || `Q${index + 1}`;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${showAnsweredBadge
                ? 'bg-orangeFpt-100 text-orangeFpt-600'
                : 'bg-blue-50 text-orangeFpt-600'
                }`}
            >
              {questionBadgeLabel}
            </div>
            <h2 className="text-xl font-semibold text-slate-700 flex w-full">{questionText}</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 border border-gray-100 bg-slate-50 px-6 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={toggleAnswerSection}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-orangeFpt-500"
            >
              <MessageCircle className="h-4 w-4" />
              {answerToggleLabel}
              <ChevronDown className={`h-4 w-4 transition-transform ${isAnswerSectionOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canSubmitAnswer && (
              <button
                type="button"
                onClick={toggleFormSection}
                disabled={userHasAnswered}
                className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                title={userHasAnswered ? 'You have already answered this question' : ''}
              >
                <PenLine className="h-4 w-4" />
                {isFormOpen ? 'Close Form' : 'Write Answer'}
              </button>
            )}
          </div>
        </div>

        {showAnswerForm && renderedInput && (
          <div className="fade-in border border-blue-100 bg-blue-50 px-6 py-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {shouldShowImage ? (
                  <img
                    src={responderAvatar}
                    alt={responderName}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-full border border-blue-200 object-cover"
                  />
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 text-xs font-semibold ${responderColorClass}`}>
                    {responderInitials}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                {renderedInput}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={toggleFormSection}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold transition hover:bg-white"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmit?.()}
                    disabled={isSubmitting || !draftValue.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-4 text-xs font-semibold text-red-600">
            {errorMessage}
          </div>
        )}
        {isAnswerSectionOpen && (
          <div className="fade-in border border-gray-100 px-6 py-5">
            <QuestionAnswers
              answers={answers}
              isLoading={isLoading}
              answerListIsEmpty={answerListIsEmpty}
              currentUserId={currentUserId}
              readOnly={readOnly}
              isQuestionLocked={isQuestionLocked}
              userHasAnswered={userHasAnswered}
              answerActionMap={answerActionMap}
              onRateAnswer={onRateAnswer}
              onEditAnswer={onEditAnswer}
              onDeleteAnswer={onDeleteAnswer}
              autoResizeTextarea={autoResizeTextarea}
              persistedExpandedEvaluations={persistedExpandedEvaluations}
              onPersistedExpandedEvaluationsChange={onPersistedExpandedEvaluationsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionItem;
