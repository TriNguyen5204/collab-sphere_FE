import React from 'react';
import { Calendar, User, Star, MessageSquare } from 'lucide-react';

const EvaluationHistory = ({ evaluations }) => {
  const getAverageRating = (ratings) => {
    const values = Object.values(ratings);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Evaluations Yet</h3>
        <p className="text-gray-600">Your evaluation history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evaluations.map((evaluation) => {
        const avgRating = getAverageRating(evaluation.ratings);
        
        return (
          <div key={evaluation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {evaluation.evaluatee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Evaluation for {evaluation.evaluatee}
                    </h3>
                    <p className="text-sm text-gray-600">{evaluation.milestone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
                    <span className="text-gray-600">/5.0</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {evaluation.status}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(evaluation.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>By {evaluation.evaluator}</span>
                </div>
              </div>

              {/* Ratings Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(evaluation.ratings).map(([category, rating]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderStars(rating)}
                      <span className="text-sm font-semibold text-gray-900">{rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Comments:</p>
                <p className="text-sm text-gray-900">{evaluation.comments}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EvaluationHistory;