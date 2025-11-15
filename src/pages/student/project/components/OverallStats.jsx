import React from 'react';
import { TrendingUp, Bug, ShieldAlert, Lightbulb } from 'lucide-react';

/**
 * StatsOverview Component
 * Displays a 4-card grid showing AI analysis metrics in a visually scannable way
 * Color-coded by score ranges with professional developer aesthetics
 * 
 * @param {Object} props
 * @param {Object} props.analysis - The PR analysis data
 * @param {number} props.analysis.aiOverallSCore - Overall quality score (0-10) - Note: typo in API
 * @param {number} props.analysis.aiBugCount - Number of bugs detected
 * @param {number} props.analysis.aiSecurityIssueCount - Number of security issues
 * @param {number} props.analysis.aiSuggestionCount - Number of improvement suggestions
 */
const StatsOverview = ({ analysis }) => {
  // Handle the typo in the API response: aiOverallSCore
  const score = analysis.aiOverallSCore || analysis.aiOverallScore || 0;

  /**
   * Get color classes and labels based on score range
   * 8-10: Green (Excellent)
   * 5-7: Yellow (Good)
   * 0-4: Red (Needs Improvement)
   */
  const getScoreConfig = (scoreValue) => {
    if (scoreValue >= 8) {
      return {
        border: 'border-green-500',
        text: 'text-green-600',
        bg: 'bg-green-50',
        label: 'Excellent',
        icon: '🎉'
      };
    }
    if (scoreValue >= 5) {
      return {
        border: 'border-yellow-500',
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        label: 'Good',
        icon: '👍'
      };
    }
    return {
      border: 'border-red-500',
      text: 'text-red-600',
      bg: 'bg-red-50',
      label: 'Needs Work',
      icon: '⚠️'
    };
  };

  const scoreConfig = getScoreConfig(score);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Overall Score Card - Most Prominent */}
      <div className={`${scoreConfig.bg} border-2 ${scoreConfig.border} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{scoreConfig.icon}</span>
          <TrendingUp className={`w-6 h-6 ${scoreConfig.text}`} />
        </div>
        <div className={`text-5xl font-extrabold ${scoreConfig.text} mb-2 leading-none`}>
          {typeof score === 'number' ? score.toFixed(1) : score}
          <span className="text-2xl font-semibold text-gray-500">/10</span>
        </div>
        <div className="text-sm font-bold text-gray-900 mb-1">{scoreConfig.label}</div>
        <div className="text-xs text-gray-600 uppercase tracking-wide">Overall Score</div>
      </div>

      {/* Bugs Found Card */}
      <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-4xl font-bold text-red-600 leading-none">
            {analysis.aiBugCount || 0}
          </div>
        </div>
        <div className="text-sm font-bold text-gray-900 mb-1">Bugs Found</div>
        <div className="text-xs text-gray-600 uppercase tracking-wide">
          Critical issues detected
        </div>
      </div>

      {/* Security Issues Card */}
      <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-4xl font-bold text-orange-600 leading-none">
            {analysis.aiSecurityIssueCount || 0}
          </div>
        </div>
        <div className="text-sm font-bold text-gray-900 mb-1">Security Issues</div>
        <div className="text-xs text-gray-600 uppercase tracking-wide">
          Vulnerabilities found
        </div>
      </div>

      {/* Suggestions Card */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-4xl font-bold text-blue-600 leading-none">
            {analysis.aiSuggestionCount || 0}
          </div>
        </div>
        <div className="text-sm font-bold text-gray-900 mb-1">Suggestions</div>
        <div className="text-xs text-gray-600 uppercase tracking-wide">
          Improvements recommended
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
