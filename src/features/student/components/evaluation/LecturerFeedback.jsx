import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User, Star, ThumbsUp, AlertTriangle, Code, Users } from 'lucide-react';

const LecturerFeedback = ({ feedbackList }) => {
  const [expandedFeedback, setExpandedFeedback] = useState(null);

  const toggleExpand = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  if (feedbackList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <AlertTriangle className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Feedback Yet</h3>
        <p className="text-gray-600">Lecturer feedback will appear here after milestone evaluations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((feedback) => {
        const isExpanded = expandedFeedback === feedback.id;
        
        return (
          <div key={feedback.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleExpand(feedback.id)}
              className="w-full p-6 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{feedback.milestone}</h3>
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                      <Star className="text-yellow-600 fill-yellow-600" size={16} />
                      <span className="text-sm font-semibold text-yellow-700">
                        {feedback.overallRating}/5.0
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{feedback.lecturer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t">
                {/* Strengths */}
                <div className="mt-6">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <ThumbsUp className="text-green-600" size={20} />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {feedback.feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="mt-6">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <AlertTriangle className="text-orange-600" size={20} />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {feedback.feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Feedback */}
                <div className="mt-6">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <Code className="text-blue-600" size={20} />
                    Technical Feedback
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">{feedback.feedback.technicalFeedback}</p>
                  </div>
                </div>

                {/* Teamwork Feedback */}
                <div className="mt-6">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <Users className="text-purple-600" size={20} />
                    Teamwork Feedback
                  </h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700">{feedback.feedback.teamworkFeedback}</p>
                  </div>
                </div>

                {/* Individual Scores */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Individual Scores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedback.individualScores.map((score, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{score.member}</span>
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-400 fill-yellow-400" size={16} />
                            <span className="font-bold text-gray-900">{score.score}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{score.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LecturerFeedback;
