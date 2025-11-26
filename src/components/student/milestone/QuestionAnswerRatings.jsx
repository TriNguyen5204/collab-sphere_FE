import React from 'react';
import { Loader2, Star } from 'lucide-react';

const MAX_SCORE = 5;

const QuestionAnswerRatings = ({
  ratingDraft = { score: 0, comment: '' },
  ratingDisabled = false,
  isRatingPending = false,
  onScoreChange,
  onCommentChange,
  onSubmit,
  onCancel,
  autoResizeTextarea,
}) => {
  const handleScoreSelect = (value) => {
    if (ratingDisabled) return;
    onScoreChange?.(value);
  };

  const handleCommentChange = (event) => {
    onCommentChange?.(event.target.value);
  };

  const handleCommentInput = (event) => {
    autoResizeTextarea?.(event.currentTarget);
  };

  const actionDisabled = ratingDisabled || isRatingPending;

  return (
    <div className="fade-in rounded-2xl border border-orangeFpt-200 bg-orangeFpt-50/80 px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-orangeFpt-600">
            Rate this answer
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_SCORE }, (_, index) => {
              const value = index + 1;
              const isActive = value <= (ratingDraft.score ?? 0);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleScoreSelect(value)}
                  className={`transition ${isActive ? 'text-amber-500' : 'text-amber-200 hover:text-amber-300'}`}
                  disabled={actionDisabled}
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
        </div>
        <textarea
          value={ratingDraft.comment ?? ''}
          onChange={handleCommentChange}
          onInput={handleCommentInput}
          placeholder="Leave a short feedback (optional)"
          rows={2}
          className="w-full resize-none rounded-lg border border-orangeFpt-200 bg-white px-3 py-2 text-xs text-orangeFpt-900 focus:border-orangeFpt-400 focus:outline-none focus:ring-2 focus:ring-orangeFpt-200"
          disabled={actionDisabled}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-orangeFpt-200 px-3 py-1.5 text-xs font-medium text-orangeFpt-600 hover:bg-orangeFpt-100"
            disabled={actionDisabled}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-orangeFpt-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orangeFpt-600 disabled:cursor-not-allowed disabled:bg-orangeFpt-300"
            disabled={actionDisabled || (ratingDraft.score ?? 0) === 0}
          >
            {isRatingPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Submit rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionAnswerRatings;