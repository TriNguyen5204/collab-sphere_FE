import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import QuestionAnswers from './QuestionAnswers';

const autoResizeTextarea = (element) => {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
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
}) => {
  const canInteract =
    !readOnly &&
    milestoneStatus !== 'completed' &&
    milestoneStatus !== 'locked';

  const answerTextareaRef = useRef(null);
  const [isAnswerSectionOpen, setIsAnswerSectionOpen] = useState(true);

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
    setIsAnswerSectionOpen((prev) => !prev);
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
  const questionTitle = question?.question ?? question?.content ?? question?.text ?? 'Question';
  const questionBadgeLabel = questionCode || `Q${index + 1}`;

  return (
    <div className="space-y-4">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-lg border px-3 py-1 text-sm font-semibold ${showAnsweredBadge
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-blue-200 bg-blue-50 text-blue-600'
                }`}
            >
              {questionBadgeLabel}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{questionTitle}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MessageSquare size={16} />
              <span>{answerSummary}</span>
            </div>
            <button
              type="button"
              onClick={toggleAnswerSection}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {isAnswerSectionOpen ? (
                <>
                  <ChevronUp size={14} />
                  Hide answers
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Show answers
                </>
              )}
            </button>
          </div>
        </div>

        {renderedInput && (
          <div className="rounded-2xl p-4">
            <div className="space-y-3">
              {renderedInput}
              {canSubmitAnswer && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSubmit?.()}
                    disabled={isSubmitting || !draftValue.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Answer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        {isAnswerSectionOpen && (
          <div className="ml-3 space-y-4 border-l-4 border-blue-100 pl-4">
            <QuestionAnswers
              answers={answers}
              isLoading={isLoading}
              answerListIsEmpty={answerListIsEmpty}
              currentUserId={currentUserId}
              readOnly={readOnly}
              isQuestionLocked={isQuestionLocked}
              answerActionMap={answerActionMap}
              onRateAnswer={onRateAnswer}
              onEditAnswer={onEditAnswer}
              onDeleteAnswer={onDeleteAnswer}
              autoResizeTextarea={autoResizeTextarea}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionItem;