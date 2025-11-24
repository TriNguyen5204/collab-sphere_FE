import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import QuestionItem from './QuestionItem';
import {
  getMilestoneQuestionsAnswersByQuestionId,
  postCreateMilestoneQuestionAnswer,
  patchUpdateMilestoneQuestionAnswer,
  deleteMilestoneQuestionAnswer,
  postEvaluateAndFeedbackMilestoneAnswer,
} from '../../../services/studentApi';

const deriveQuestionId = (question, fallbackIndex) =>
  question?.id ?? question?.milestoneQuestionId ?? fallbackIndex;

const buildBooleanStateMap = (questionList) => {
  const state = {};
  questionList.forEach((question, index) => {
    const identifier = deriveQuestionId(question, index);
    state[identifier] = false;
  });
  return state;
};

const buildExpandedStateMap = (questionList) => {
  const state = {};
  questionList.forEach((question, index) => {
    const identifier = deriveQuestionId(question, index);
    state[identifier] = {};
  });
  return state;
};

const MilestoneQuestions = ({
  milestone,
  milestoneStatus,
  readOnly = false,
  onAnswerSubmitted = () => {},
}) => {
  const questions = useMemo(
    () => (Array.isArray(milestone?.questions) ? milestone.questions : []),
    [milestone]
  );

  const [drafts, setDrafts] = useState({});
  const [answersMap, setAnswersMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [submitMap, setSubmitMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const isMountedRef = useRef(true);
  const [answerActionMap, setAnswerActionMap] = useState({});
  const [answerSectionState, setAnswerSectionState] = useState(() => buildBooleanStateMap(questions));
  const [answerFormState, setAnswerFormState] = useState(() => buildBooleanStateMap(questions));
  const [expandedEvaluationState, setExpandedEvaluationState] = useState(() => buildExpandedStateMap(questions));

  const currentUserId = useSelector((state) => state.user.userId);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const questionIds = useMemo(
    () => questions.map((question, index) => deriveQuestionId(question, index)),
    [questions]
  );

  useEffect(() => {
    setAnswerSectionState((prev) => {
      const next = {};
      questionIds.forEach((id) => {
        next[id] = prev[id] ?? false;
      });
      return next;
    });

    setAnswerFormState((prev) => {
      const next = {};
      questionIds.forEach((id) => {
        next[id] = prev[id] ?? false;
      });
      return next;
    });

    setExpandedEvaluationState((prev) => {
      const next = {};
      questionIds.forEach((id) => {
        next[id] = prev[id] ?? {};
      });
      return next;
    });
  }, [questionIds]);

  const fetchAnswersForQuestion = useCallback(async (questionId) => {
    setLoadingMap((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await getMilestoneQuestionsAnswersByQuestionId(questionId);
      const list = Array.isArray(response?.answersList) ? response.answersList : [];
      const normalized = list.map((item, index) => ({
        id:
          item.milestoneQuestionAnsId ??
          item.id ??
          `${questionId}-${index}`,
        content: item.answer ?? item.content ?? '',
        author: item.studentName ?? 'Unknown member',
        authorCode: item.studentCode ?? '',
        avatar: item.studentAvatar ?? null,
        authorId: item.studentId ?? item.studentUserId ?? item.userId ?? null,
        createdAt: item.createTime ?? item.createdTime ?? null,
        evaluations: Array.isArray(item.answerEvaluations)
          ? item.answerEvaluations.map((evaluation, evalIdx) => ({
            id:
              evaluation.answerEvaluationId ??
              evaluation.id ??
              `${questionId}-${index}-ev-${evalIdx}`,
            evaluator: evaluation.evaluatorName ?? 'Evaluator',
            evaluatorCode: evaluation.evaluatorCode ?? '',
            evaluatorAvatar: evaluation.evaluatorAvatar ?? null,
            evaluatorId: evaluation.evaluatorId ?? evaluation.userId ?? null,
            score: typeof evaluation.score === 'number' ? evaluation.score : null,
            comment: evaluation.comment ?? '',
            createdAt: evaluation.createTime ?? evaluation.createdAt ?? null,
          }))
          : [],
      }));
      if (!isMountedRef.current) return;
      setAnswersMap((prev) => ({ ...prev, [questionId]: normalized }));
      setErrorMap((prev) => ({ ...prev, [questionId]: null }));
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to load answers';
      if (isMountedRef.current) {
        setAnswersMap((prev) => ({ ...prev, [questionId]: [] }));
        setErrorMap((prev) => ({ ...prev, [questionId]: message }));
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMap((prev) => ({ ...prev, [questionId]: false }));
      }
    }
  }, []);

  useEffect(() => {
    if (questionIds.length === 0) {
      setDrafts({});
      setAnswersMap({});
      setLoadingMap({});
      setSubmitMap({});
      setErrorMap({});
      setAnswerActionMap({});
      return;
    }

    setDrafts((prev) => {
      const next = {};
      questionIds.forEach((id) => {
        next[id] = prev[id] ?? '';
      });
      return next;
    });

    questionIds.forEach((id) => {
      if (!answersMap[id]) {
        fetchAnswersForQuestion(id);
      }
    });
  }, [questionIds, answersMap, fetchAnswersForQuestion]);

  const handleDraftChange = useCallback((questionId, value) => {
    setDrafts((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (questionId) => {
      const rawValue = drafts[questionId] ?? '';
      const trimmed = rawValue.trim();
      if (!trimmed) {
        toast.error('Please enter your answer before submitting.');
        return;
      }

      setSubmitMap((prev) => ({ ...prev, [questionId]: true }));
      try {
        console.log('Submitting answer for questionId:', questionId, 'with content:', trimmed);
        await postCreateMilestoneQuestionAnswer(questionId, trimmed);
        if (isMountedRef.current) {
          toast.success('Answer submitted');
          setDrafts((prev) => ({ ...prev, [questionId]: '' }));
          setAnswerFormState((prev) => ({ ...prev, [questionId]: false }));
        }
        await fetchAnswersForQuestion(questionId);
        if (isMountedRef.current) {
          onAnswerSubmitted?.(questionId);
        }
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to submit answer';
        if (isMountedRef.current) {
          toast.error(message);
        }
      } finally {
        if (isMountedRef.current) {
          setSubmitMap((prev) => ({ ...prev, [questionId]: false }));
        }
      }
    },
    [drafts, fetchAnswersForQuestion, onAnswerSubmitted]
  );

  const setAnswerAction = useCallback((answerId, status) => {
    if (!answerId || !isMountedRef.current) return;
    setAnswerActionMap((prev) => ({ ...prev, [answerId]: status }));
  }, []);

  const clearAnswerAction = useCallback((answerId) => {
    if (!answerId || !isMountedRef.current) return;
    setAnswerActionMap((prev) => {
      const next = { ...prev };
      delete next[answerId];
      return next;
    });
  }, []);

  const handleRateAnswer = useCallback(
    async (questionId, answerId, payload) => {
      if (!answerId || !payload || typeof payload.score !== 'number') {
        toast.error('Please select a rating before submitting.');
        return false;
      }

      setAnswerAction(answerId, 'rating');
      try {
        await postEvaluateAndFeedbackMilestoneAnswer(answerId, payload);
        toast.success('Rating submitted');
        await fetchAnswersForQuestion(questionId);
        return true;
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to submit rating';
        toast.error(message);
        return false;
      } finally {
        clearAnswerAction(answerId);
      }
    },
    [clearAnswerAction, fetchAnswersForQuestion, setAnswerAction]
  );

  const handleEditAnswer = useCallback(
    async (questionId, answerId, content) => {
      if (!answerId) {
        toast.error('Answer not found.');
        return false;
      }
      const trimmed = (content ?? '').trim();
      if (!trimmed) {
        toast.error('Answer cannot be empty.');
        return false;
      }

      setAnswerAction(answerId, 'editing');
      try {
        await patchUpdateMilestoneQuestionAnswer(questionId, answerId, trimmed);
        toast.success('Answer updated');
        await fetchAnswersForQuestion(questionId);
        return true;
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to update answer';
        toast.error(message);
        return false;
      } finally {
        clearAnswerAction(answerId);
      }
    },
    [clearAnswerAction, fetchAnswersForQuestion, setAnswerAction]
  );

  const handleDeleteAnswer = useCallback(
    async (questionId, answerId) => {
      if (!answerId) {
        toast.error('Answer not found.');
        return false;
      }

      setAnswerAction(answerId, 'deleting');
      try {
        await deleteMilestoneQuestionAnswer(questionId, answerId);
        toast.success('Answer deleted');
        await fetchAnswersForQuestion(questionId);
        return true;
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to delete answer';
        toast.error(message);
        return false;
      } finally {
        clearAnswerAction(answerId);
      }
    },
    [clearAnswerAction, fetchAnswersForQuestion, setAnswerAction]
  );

  const handleAnswerSectionOpenChange = useCallback((questionId, nextState) => {
    setAnswerSectionState((prev) => ({ ...prev, [questionId]: Boolean(nextState) }));
  }, []);

  const handleFormOpenChange = useCallback((questionId, nextState) => {
    setAnswerFormState((prev) => ({ ...prev, [questionId]: Boolean(nextState) }));
  }, []);

  const handleExpandedEvaluationsChange = useCallback((questionId, nextState) => {
    setExpandedEvaluationState((prev) => ({
      ...prev,
      [questionId]: nextState || {},
    }));
  }, []);

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        No questions available for this milestone.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((question, index) => {
        const questionId = question?.id ?? question?.milestoneQuestionId ?? index;
        const answers = answersMap[questionId] ?? [];
        const isLoading = Boolean(loadingMap[questionId]);
        const isSubmitting = Boolean(submitMap[questionId]);
        const errorMessage = errorMap[questionId];
        const baseCount = typeof question?.answerCount === 'number' ? question.answerCount : 0;
        const derivedCount = Math.max(baseCount, answers.length);

        return (
          <QuestionItem
            key={questionId}
            question={question}
            index={index}
            milestoneStatus={milestoneStatus}
            readOnly={readOnly}
            draftValue={drafts[questionId] ?? ''}
            onDraftChange={(value) => handleDraftChange(questionId, value)}
            onSubmit={() => handleSubmit(questionId)}
            answers={answers}
            answerCount={derivedCount}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            currentUserId={currentUserId}
            onRateAnswer={(answerId, payload) => handleRateAnswer(questionId, answerId, payload)}
            onEditAnswer={(answerId, content) => handleEditAnswer(questionId, answerId, content)}
            onDeleteAnswer={(answerId) => handleDeleteAnswer(questionId, answerId)}
            answerActionMap={answerActionMap}
            isAnswerSectionOpen={answerSectionState[questionId] ?? false}
            onAnswerSectionOpenChange={(next) => handleAnswerSectionOpenChange(questionId, next)}
            isFormOpen={answerFormState[questionId] ?? false}
            onFormOpenChange={(next) => handleFormOpenChange(questionId, next)}
            persistedExpandedEvaluations={expandedEvaluationState[questionId]}
            onPersistedExpandedEvaluationsChange={(next) => handleExpandedEvaluationsChange(questionId, next)}
          />
        );
      })}
    </div>
  );
};

export default MilestoneQuestions;