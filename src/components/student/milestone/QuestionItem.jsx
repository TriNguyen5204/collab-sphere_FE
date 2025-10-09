import React from 'react';
import { CheckCircle, Users, Clock } from 'lucide-react';

const QuestionItem = ({ 
  question, 
  index, 
  milestoneStatus, 
  currentAnswer, 
  onAnswerChange, 
  onSaveAnswer 
}) => {
  const hasAnswer = question.answer && question.answer !== "";

  const renderInput = () => {
    if (milestoneStatus === 'completed' || milestoneStatus === 'locked') {
      return null;
    }

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'boolean':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
          hasAnswer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-2">{question.question}</p>
          
          {/* Answer Input based on type */}
          {milestoneStatus !== 'completed' && milestoneStatus !== 'locked' && (
            <div className="mb-3">
              {renderInput()}
            </div>
          )}

          {/* Display existing answer */}
          {hasAnswer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{question.answer}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <Users size={12} />
                <span>Answered by {question.answeredBy}</span>
                <span className="text-gray-400">•</span>
                <Clock size={12} />
                <span>{new Date(question.answeredAt).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Save Button */}
          {milestoneStatus !== 'completed' && milestoneStatus !== 'locked' && (
            <button
              onClick={() => onSaveAnswer(question.id)}
              disabled={!currentAnswer || currentAnswer === ""}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {hasAnswer ? 'Update Answer' : 'Save Answer'}
            </button>
          )}
        </div>

        {hasAnswer && (
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
        )}
      </div>
    </div>
  );
};

export default QuestionItem;