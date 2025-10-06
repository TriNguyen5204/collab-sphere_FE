import React from 'react';
import { MessageSquare } from 'lucide-react';
import QuestionItem from './QuestionItem';

const MilestoneQuestions = ({ 
  milestone, 
  answers, 
  onAnswerChange, 
  onSaveAnswer 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageSquare size={24} />
        Milestone Questions
      </h3>

      <div className="space-y-6">
        {milestone.questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            milestoneStatus={milestone.status}
            currentAnswer={answers[question.id] !== undefined ? answers[question.id] : question.answer}
            onAnswerChange={onAnswerChange}
            onSaveAnswer={onSaveAnswer}
          />
        ))}
      </div>
    </div>
  );
};

export default MilestoneQuestions;