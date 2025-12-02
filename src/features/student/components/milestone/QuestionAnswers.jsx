import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Loader2, MessageCircle, MoreVertical, Pencil, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import useToastConfirmation from '../../../../hooks/useToastConfirmation.jsx';
import QuestionAnswerRatings from './QuestionAnswerRatings';

const MAX_SCORE = 5;

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

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

const renderStarsDisplay = (stars, filledClass = 'fill-amber-400 text-amber-400', emptyClass = 'text-amber-200') => (
  <div className="flex items-center gap-1 text-amber-200">
    {stars.map((filled, starIndex) => (
      <svg
        key={starIndex}
        className={`h-4 w-4 ${filled ? filledClass : emptyClass}`}
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.042 6.29a1 1 0 0 0 .95.69h6.615c.969 0 1.371 1.24.588 1.81l-5.354 3.89a1 1 0 0 0-.363 1.118l2.042 6.29c.3.921-.755 1.688-1.538 1.118l-5.354-3.89a1 1 0 0 0-1.176 0l-5.354 3.89c-.783.57-1.838-.197-1.539-1.118l2.043-6.29a1 1 0 0 0-.364-1.118l-5.354-3.89c-.782-.57-.38-1.81.588-1.81h6.616a1 1 0 0 0 .95-.69l2.042-6.29Z"
        />
      </svg>
    ))}
  </div>
);

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

const defaultAutoResizeTextarea = (element) => {
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};

const QuestionAnswers = ({
  answers = [],
  isLoading = false,
  answerListIsEmpty = false,
  currentUserId = null,
  readOnly = false,
  isQuestionLocked = false,
  answerActionMap = {},
  onRateAnswer,
  onEditAnswer,
  onDeleteAnswer,
  autoResizeTextarea,
  persistedExpandedEvaluations,
  onPersistedExpandedEvaluationsChange,
}) => {
  const [activeRatingAnswerId, setActiveRatingAnswerId] = useState(null);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [activeEditAnswerId, setActiveEditAnswerId] = useState(null);
  const [editDrafts, setEditDrafts] = useState({});
  const [openActionsAnswerId, setOpenActionsAnswerId] = useState(null);
  const [localExpandedEvaluations, setLocalExpandedEvaluations] = useState({});
  const confirmWithToast = useToastConfirmation();

  const actionMenuRefs = useRef({});
  const editTextareaRefs = useRef({});
  const wasControlledRef = useRef(false);

  const resizeTextarea = useMemo(
    () => autoResizeTextarea ?? defaultAutoResizeTextarea,
    [autoResizeTextarea],
  );

  const isControlledExpandedState =
    Boolean(persistedExpandedEvaluations) && typeof onPersistedExpandedEvaluationsChange === 'function';
  const expandedEvaluations = isControlledExpandedState
    ? persistedExpandedEvaluations
    : localExpandedEvaluations;

  const setExpandedEvaluationsState = useCallback(
    (updater) => {
      if (isControlledExpandedState) {
        const previous = expandedEvaluations ?? {};
        const nextState = typeof updater === 'function' ? updater(previous) : updater;
        if (nextState !== previous) {
          onPersistedExpandedEvaluationsChange(nextState);
        }
      } else {
        setLocalExpandedEvaluations(updater);
      }
    },
    [expandedEvaluations, isControlledExpandedState, onPersistedExpandedEvaluationsChange],
  );

  useEffect(() => {
    if (isControlledExpandedState && !wasControlledRef.current && Object.keys(localExpandedEvaluations).length > 0) {
      onPersistedExpandedEvaluationsChange(localExpandedEvaluations);
    }
    wasControlledRef.current = isControlledExpandedState;
  }, [isControlledExpandedState, localExpandedEvaluations, onPersistedExpandedEvaluationsChange]);

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
    Object.values(editTextareaRefs.current).forEach((node) => resizeTextarea(node));
  }, [editDrafts, resizeTextarea]);

  useEffect(() => {
    if (activeRatingAnswerId && !answers.some((answer) => String(answer.id) === String(activeRatingAnswerId))) {
      setActiveRatingAnswerId(null);
    }
    if (activeEditAnswerId && !answers.some((answer) => String(answer.id) === String(activeEditAnswerId))) {
      setActiveEditAnswerId(null);
    }
  }, [activeEditAnswerId, activeRatingAnswerId, answers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openActionsAnswerId) return;
      const menuNode = actionMenuRefs.current[String(openActionsAnswerId)];
      if (menuNode && !menuNode.contains(event.target)) {
        setOpenActionsAnswerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionsAnswerId]);

  useEffect(() => {
    const currentIds = new Set(answers.map((answer) => String(answer.id)));
    Object.keys(actionMenuRefs.current).forEach((key) => {
      if (!currentIds.has(key)) {
        delete actionMenuRefs.current[key];
      }
    });
  }, [answers]);

  useEffect(() => {
    const prev = expandedEvaluations ?? {};
    const next = {};
    answers.forEach((answer) => {
      const key = String(answer.id);
      next[key] = prev[key] ?? false;
    });
    const hasChanged =
      Object.keys(prev).length !== Object.keys(next).length ||
      Object.keys(next).some((key) => next[key] !== prev[key]);
    if (hasChanged) {
      setExpandedEvaluationsState(next);
    }
  }, [answers, expandedEvaluations, setExpandedEvaluationsState]);

  const handleRatingToggle = (answerId) => {
    setActiveRatingAnswerId((prev) => (prev === answerId ? null : answerId));
    if (activeEditAnswerId === answerId) {
      setActiveEditAnswerId(null);
    }
    if (openActionsAnswerId === answerId) {
      setOpenActionsAnswerId(null);
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
    if (openActionsAnswerId === answerId) {
      setOpenActionsAnswerId(null);
    }
    setTimeout(() => {
      resizeTextarea(editTextareaRefs.current[String(answerId)]);
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
    if (openActionsAnswerId === answerId) {
      setOpenActionsAnswerId(null);
    }
    const confirmed = await confirmWithToast({
      message: 'Delete this answer? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }
    await onDeleteAnswer(answerId);
  };

  const toggleActionMenu = (answerId) => {
    setOpenActionsAnswerId((prev) => (prev === answerId ? null : answerId));
  };

  const toggleEvaluationSection = (answerId) => {
    const key = String(answerId);
    setExpandedEvaluationsState((prev = {}) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading answers...
      </div>
    );
  }

  if (answerListIsEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        There are no answers yet. Be the first to help your teammates.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {answers.map((answer, answerIndex) => {
        const answerIdKey = String(answer.id);
        const isOwnAnswer = currentUserId && answer.authorId && String(answer.authorId) === String(currentUserId);
        const averageScore = calculateAverageScore(answer.evaluations);
        const baseScore = typeof answer.score === 'number' && !Number.isNaN(answer.score) ? answer.score : averageScore;
        const scoreStars = buildStars(typeof baseScore === 'number' ? baseScore : 0);
        const displayedScore = typeof baseScore === 'number' ? formatScore(baseScore) : '—';
        const isRating = activeRatingAnswerId === answer.id;
        const ratingDraft = ratingDrafts[answerIdKey] ?? { score: 0, comment: '' };
        const isEditing = activeEditAnswerId === answer.id;
        const editDraft = editDrafts[answerIdKey] ?? answer.content ?? '';
        const answerAction = answerActionMap?.[answer.id];
        const actionInProgress = Boolean(answerAction);
        const isRatingPending = answerAction === 'rating';
        const isEditingPending = answerAction === 'editing';
        const isDeletingPending = answerAction === 'deleting';

        const canRate = !readOnly && !isOwnAnswer && !isQuestionLocked;
        const canModifyOwn = !readOnly && isOwnAnswer && !isQuestionLocked;
        const answerLabel = answer.answerLabel ?? answer.author ?? `Answer ${answerIndex + 1}`;
        const studentAnswerText = answer.content ?? answer.answerStudent ?? 'No answer yet.';
        const evaluationCount = Array.isArray(answer.evaluations) ? answer.evaluations.length : 0;
        const evaluationToggleLabel = expandedEvaluations[answerIdKey]
          ? 'Hide Feedbacks'
          : evaluationCount > 0
            ? `Show ${evaluationCount} Feedback${evaluationCount === 1 ? '' : 's'}`
            : 'Show Feedbacks';

        return (
          <article
            key={answer.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                {answer.avatar ? (
                  <img
                    src={answer.avatar}
                    alt={`${answerLabel || 'Student'} avatar`}
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <User size={20} />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900">{answerLabel}</p>
                  {answer.authorCode && (
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{answer.authorCode}</p>
                  )}
                  {answer.authorRole && (
                    <p className="text-xs text-slate-500">{answer.authorRole}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {renderStarsDisplay(scoreStars, 'fill-amber-400 text-amber-400', 'text-amber-200')}
                  <span className="text-orangeFpt-500">{displayedScore}/5</span>
                </div>
                {canModifyOwn && !isEditing && (
                  <div
                    className="relative"
                    ref={(node) => {
                      if (node) {
                        actionMenuRefs.current[answerIdKey] = node;
                      } else {
                        delete actionMenuRefs.current[answerIdKey];
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleActionMenu(answer.id)}
                      className="rounded-full border border-slate-200 bg-white/70 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                      disabled={actionInProgress}
                      aria-label="Answer actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openActionsAnswerId === answer.id && (
                      <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(answer.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                          disabled={isEditingPending}
                        >
                          <Pencil size={14} />
                          Edit answer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(answer.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                          disabled={isDeletingPending}
                        >
                          {isDeletingPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {isEditing ? (
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <textarea
                    ref={(node) => {
                      if (node) {
                        editTextareaRefs.current[answerIdKey] = node;
                        resizeTextarea(node);
                      }
                    }}
                    value={editDraft}
                    onChange={(event) =>
                      setEditDrafts((prev) => ({
                        ...prev,
                        [answerIdKey]: event.target.value,
                      }))
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-200"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => cancelEdit(answer.id)}
                      className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                      disabled={isEditingPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => submitEdit(answer.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={isEditingPending || !editDraft.trim()}
                    >
                      {isEditingPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {studentAnswerText}
                </p>
              )}

              {!isEditing && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleEvaluationSection(answer.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-orangeFpt-500"
                    >
                      {evaluationToggleLabel}
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${expandedEvaluations[answerIdKey] ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {canRate && (
                      <button
                        type="button"
                        onClick={() => handleRatingToggle(answer.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-orangeFpt-500 hover:text-orangeFpt-600"
                        disabled={actionInProgress}
                      >
                        <span>{isRating ? 'Close form' : 'Rate Answer'}</span>
                      </button>
                    )}

                  </div>
                  {answer.createdAt && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTimestamp(answer.createdAt)}</span>
                    </div>
                  )}

                </div>
              )}

              {isRating && canRate && (
                <QuestionAnswerRatings
                  ratingDraft={ratingDraft}
                  ratingDisabled={actionInProgress}
                  isRatingPending={isRatingPending}
                  onScoreChange={(score) => handleRatingChange(answer.id, score)}
                  onCommentChange={(comment) => handleRatingCommentChange(answer.id, comment)}
                  onCancel={() => setActiveRatingAnswerId(null)}
                  onSubmit={() => submitRating(answer.id)}
                  autoResizeTextarea={resizeTextarea}
                />
              )}

              {expandedEvaluations[answerIdKey] && (
                <div className="p-4">
                  {Array.isArray(answer.evaluations) && answer.evaluations.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {answer.evaluations.map((evaluation) => {
                        const stars = buildStars(evaluation.score);
                        return (
                          <div
                            key={evaluation.id}
                            className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-white px-3 py-3"
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
                                  <p className="text-sm font-semibold text-slate-900">
                                    {evaluation.evaluator}
                                  </p>
                                  {evaluation.evaluatorCode && (
                                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                      {evaluation.evaluatorCode}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-amber-200 rounded-full border border-amber-100 bg-amber-50 px-3 py-1">
                                  {renderStarsDisplay(stars)}
                                  <span className="ml-1 text-xs font-semibold text-orangeFpt-500">
                                    {formatScore(evaluation.score)}/5
                                  </span>
                                </div>
                              </div>
                              {evaluation.comment && (
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">
                                  {evaluation.comment}
                                </p>
                              )}
                              {evaluation.createdAt && (
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">
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
                    <p className="mt-2 text-xs text-slate-400">No evaluations yet.</p>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default QuestionAnswers;
