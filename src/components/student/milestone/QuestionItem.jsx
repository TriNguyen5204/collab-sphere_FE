import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Clock, Loader2, MessageSquare, Star, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const MAX_SCORE = 5;

const buildStars = (scoreValue) => {
  const score = typeof scoreValue === 'number' ? Math.max(0, Math.min(MAX_SCORE, scoreValue)) : 0;
  const fullStars = Math.floor(score);
  return Array.from({ length: MAX_SCORE }, (_, index) => index < fullStars);
};

const getInitials = (name) => {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
};

const formatScore = (score) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return '—';
  return Number.isInteger(score) ? `${score}` : score.toFixed(1);
};

const calculateAverageScore = (evaluations) => {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return null;
  const numericScores = evaluations
    .map((evaluation) => evaluation?.score)
    .filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (numericScores.length === 0) return null;
  const total = numericScores.reduce((sum, value) => sum + value, 0);
  return total / numericScores.length;
};

const autoResizeTextarea = (element) => {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};

const Avatar = ({ src, name, className = 'h-10 w-10', textClassName = 'text-sm' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name}'s avatar` : 'Member avatar'}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  const initials = getInitials(name);
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 ${className}`}>
      <span className={textClassName}>{initials}</span>
    </div>
  );
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
  const editTextareaRefs = useRef({});

  const [activeRatingAnswerId, setActiveRatingAnswerId] = useState(null);
  const [activeEditAnswerId, setActiveEditAnswerId] = useState(null);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [editDrafts, setEditDrafts] = useState({});

  const isQuestionLocked = milestoneStatus === 'locked';

  const canSubmitAnswer = canInteract && !isQuestionLocked;

  const handleDraftChange = (value) => {
    onDraftChange?.(value);
    autoResizeTextarea(answerTextareaRef.current);
  };

  useEffect(() => {
    autoResizeTextarea(answerTextareaRef.current);
  }, [draftValue]);

  useEffect(() => {
    setEditDrafts((prev) => {
      const next = { ...prev };
      const currentIds = new Set(answers.map((answer) => String(answer.id)));
      answers.forEach((answer) => {
        const key = String(answer.id);
        if (key !== String(activeEditAnswerId)) {
          next[key] = answer.content ?? '';
        } else if (!Object.prototype.hasOwnProperty.call(next, key)) {
          next[key] = answer.content ?? '';
        }
      });
      Object.keys(next).forEach((key) => {
        if (!currentIds.has(key)) {
          delete next[key];
        }
      });
      return next;
    });

    setRatingDrafts((prev) => {
      const next = { ...prev };
      const currentIds = new Set(answers.map((answer) => String(answer.id)));
      answers.forEach((answer) => {
        const key = String(answer.id);
        if (!Object.prototype.hasOwnProperty.call(next, key)) {
          next[key] = { score: 0, comment: '' };
        }
      });
      Object.keys(next).forEach((key) => {
        if (!currentIds.has(key)) {
          delete next[key];
        }
      });
      return next;
    });
  }, [answers, activeEditAnswerId]);

  useEffect(() => {
    Object.values(editTextareaRefs.current).forEach((node) => autoResizeTextarea(node));
  }, [editDrafts]);

  useEffect(() => {
    if (activeRatingAnswerId && !answers.some((answer) => String(answer.id) === String(activeRatingAnswerId))) {
      setActiveRatingAnswerId(null);
    }
    if (activeEditAnswerId && !answers.some((answer) => String(answer.id) === String(activeEditAnswerId))) {
      setActiveEditAnswerId(null);
    }
  }, [activeEditAnswerId, activeRatingAnswerId, answers]);

  const handleRatingToggle = (answerId) => {
    setActiveRatingAnswerId((prev) => (prev === answerId ? null : answerId));
    if (activeEditAnswerId === answerId) {
      setActiveEditAnswerId(null);
    }
  };

  const handleRatingChange = (answerId, score) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [String(answerId)]: {
        score,
        comment: prev[String(answerId)]?.comment ?? '',
      },
    }));
  };

  const handleRatingCommentChange = (answerId, comment) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [String(answerId)]: {
        score: prev[String(answerId)]?.score ?? 0,
        comment,
      },
    }));
  };

  const submitRating = async (answerId) => {
    if (!onRateAnswer) return;
    const draft = ratingDrafts[String(answerId)] ?? { score: 0, comment: '' };
    if (!draft.score) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    const payload = { score: draft.score };
    const trimmedComment = draft.comment?.trim();
    if (trimmedComment) {
      payload.comment = trimmedComment;
    }

    const success = await onRateAnswer(answerId, payload);
    if (success) {
      setActiveRatingAnswerId(null);
      setRatingDrafts((prev) => ({
        ...prev,
        [String(answerId)]: { score: 0, comment: '' },
      }));
    }
  };

  const handleStartEdit = (answerId) => {
    if (activeRatingAnswerId === answerId) {
      setActiveRatingAnswerId(null);
    }
    setActiveEditAnswerId(answerId);
    setTimeout(() => {
      autoResizeTextarea(editTextareaRefs.current[String(answerId)]);
    });
  };

  const cancelEdit = (answerId) => {
    setActiveEditAnswerId(null);
    setEditDrafts((prev) => ({
      ...prev,
      [String(answerId)]: answers.find((answer) => String(answer.id) === String(answerId))?.content ?? '',
    }));
  };

  const submitEdit = async (answerId) => {
    if (!onEditAnswer) return;
    const draft = (editDrafts[String(answerId)] ?? '').trim();
    if (!draft) {
      toast.error('Answer cannot be empty.');
      return;
    }
    const success = await onEditAnswer(answerId, draft);
    if (success) {
      setActiveEditAnswerId(null);
    }
  };

  const handleDelete = async (answerId) => {
    if (!onDeleteAnswer) return;
    const confirmed = window.confirm('Delete this answer? This action cannot be undone.');
    if (!confirmed) {
      return;
    }
    await onDeleteAnswer(answerId);
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

  const renderStarsDisplay = (stars, filledClass = 'fill-amber-400 text-amber-400', emptyClass = 'text-amber-200') => (
    <div className="flex items-center gap-1 text-amber-500">
      {stars.map((filled, starIndex) => (
        <Star
          key={starIndex}
          className={`h-4 w-4 ${filled ? filledClass : emptyClass}`}
          strokeWidth={filled ? 0 : 1.5}
        />
      ))}
    </div>
  );

  const renderRatingSelector = (answerId, currentScore, disabled) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_SCORE }, (_, index) => {
        const value = index + 1;
        const isActive = value <= currentScore;
        return (
          <button
            key={value}
            type="button"
            onClick={() => !disabled && handleRatingChange(answerId, value)}
            className={`transition ${isActive ? 'text-amber-500' : 'text-amber-200 hover:text-amber-300'}`}
            disabled={disabled}
            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-6 w-6 ${isActive ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
              strokeWidth={isActive ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );

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
        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    );
  };

  const showAnsweredBadge = answerCount > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                showAnsweredBadge ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {index + 1}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900">
                {question?.question ?? 'Question'}
              </p>
              {question?.description && (
                <p className="text-sm text-slate-500">{question.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MessageSquare size={14} />
            <span>{answerSummary}</span>
          </div>
        </div>

        {renderInput()}

        {canSubmitAnswer && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onSubmit?.()}
              disabled={isSubmitting || !draftValue.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Answer
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading answers...
            </div>
          ) : answerListIsEmpty ? (
            <p className="text-sm text-slate-500">There is no answers yet.</p>
          ) : (
            answers.map((answer) => {
              const answerIdKey = String(answer.id);
              const isOwnAnswer = currentUserId && answer.authorId && String(answer.authorId) === String(currentUserId);
              const averageScore = calculateAverageScore(answer.evaluations);
              const averageStars = averageScore === null ? buildStars(0) : buildStars(averageScore);
              const isRating = activeRatingAnswerId === answer.id;
              const ratingDraft = ratingDrafts[answerIdKey] ?? { score: 0, comment: '' };
              const isEditing = activeEditAnswerId === answer.id;
              const editDraft = editDrafts[answerIdKey] ?? answer.content ?? '';
              const answerAction = answerActionMap?.[answer.id];
              const actionInProgress = Boolean(answerAction);
              const isRatingPending = answerAction === 'rating';
              const isEditingPending = answerAction === 'editing';
              const isDeletingPending = answerAction === 'deleting';
              const ratingDisabled = actionInProgress;
              const editingDisabled = actionInProgress;
              const deletingDisabled = actionInProgress;

              const canRate = !readOnly && !isOwnAnswer && !isQuestionLocked;
              const canModifyOwn = !readOnly && isOwnAnswer && !isQuestionLocked;

              return (
                <div
                  key={answer.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <Avatar src={answer.avatar} name={answer.author} />
                    <div className="flex flex-1 flex-wrap items-start justify-between gap-x-2 gap-y-1">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{answer.author}</p>
                        {answer.authorCode && (
                          <p className="text-xs uppercase tracking-wide text-slate-500">{answer.authorCode}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {averageScore !== null ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            {renderStarsDisplay(averageStars)}
                            <span className="ml-1 text-xs font-semibold text-amber-700">
                              {formatScore(averageScore)}
                            </span>
                            <span className="text-[10px] uppercase text-amber-500">avg</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No rating yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          ref={(node) => {
                            if (node) {
                              editTextareaRefs.current[answerIdKey] = node;
                              autoResizeTextarea(node);
                            }
                          }}
                          value={editDraft}
                          onChange={(event) =>
                            setEditDrafts((prev) => ({
                              ...prev,
                              [answerIdKey]: event.target.value,
                            }))
                          }
                          className="w-full resize-none rounded-lg border border-blue-200 px-3 py-2 text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => cancelEdit(answer.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            disabled={isEditingPending}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => submitEdit(answer.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            disabled={isEditingPending || !editDraft.trim()}
                          >
                            {isEditingPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                          {answer.content}
                        </p>
                        {answer.createdAt && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{formatTimestamp(answer.createdAt)}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                          {canRate && (
                            <button
                              type="button"
                              onClick={() => handleRatingToggle(answer.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1 font-medium text-amber-600 hover:bg-amber-50"
                              disabled={ratingDisabled}
                            >
                              {isRating ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              Rate Answer
                            </button>
                          )}
                          {canModifyOwn && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(answer.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1 font-medium text-blue-600 hover:bg-blue-50"
                                disabled={editingDisabled}
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(answer.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 font-medium text-rose-600 hover:bg-rose-50"
                                disabled={deletingDisabled}
                              >
                                {isDeletingPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {isRating && canRate && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                              Rate this answer
                            </span>
                            {renderRatingSelector(answer.id, ratingDraft.score, ratingDisabled)}
                          </div>
                          <textarea
                            value={ratingDraft.comment}
                            onChange={(event) => handleRatingCommentChange(answer.id, event.target.value)}
                            onInput={(event) => autoResizeTextarea(event.currentTarget)}
                            placeholder="Leave a short feedback (optional)"
                            rows={2}
                            className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveRatingAnswerId(null)}
                              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
                              disabled={isRatingPending}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => submitRating(answer.id)}
                              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                              disabled={isRatingPending || ratingDraft.score === 0}
                            >
                              {isRatingPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              Submit rating
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Evaluations
                      </p>
                      {Array.isArray(answer.evaluations) && answer.evaluations.length > 0 ? (
                        <div className="space-y-2">
                          {answer.evaluations.map((evaluation) => {
                            const stars = buildStars(evaluation.score);
                            return (
                              <div
                                key={evaluation.id}
                                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3"
                              >
                                <Avatar
                                  src={evaluation.evaluatorAvatar}
                                  name={evaluation.evaluator}
                                  className="h-9 w-9"
                                  textClassName="text-xs"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-amber-900">
                                        {evaluation.evaluator}
                                      </p>
                                      {evaluation.evaluatorCode && (
                                        <p className="text-[11px] uppercase tracking-wide text-amber-600">
                                          {evaluation.evaluatorCode}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                      {renderStarsDisplay(stars)}
                                      <span className="ml-1 text-xs font-semibold text-amber-700">
                                        {formatScore(evaluation.score)}
                                      </span>
                                      <span className="text-[10px] text-amber-500">/5</span>
                                    </div>
                                  </div>
                                  {evaluation.comment && (
                                    <p className="text-xs text-amber-800 whitespace-pre-wrap">
                                      {evaluation.comment}
                                    </p>
                                  )}
                                  {evaluation.createdAt && (
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-500">
                                      <Clock size={10} />
                                      <span>{formatTimestamp(evaluation.createdAt)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No evaluations yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showAnsweredBadge && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle size={18} />
          <span>Answered</span>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;