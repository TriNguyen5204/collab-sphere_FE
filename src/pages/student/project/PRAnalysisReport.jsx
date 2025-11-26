import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCode, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { getPRAnalysisById } from '../../../services/prAnalysisApi';

// Component imports
import AnalysisHeader from './components/AnalysisHeader';
import StatsOverview from './components/OverallStats';
import FeedbackThread from './components/FeedbackThread';

/**
 * PRAnalysisReport - Main Component
 * Professional, GitHub-style PR analysis display
 * Orchestrates the overall page layout and data management
 * 
 * Features:
 * - Parses AI feedback JSON string into structured data
 * - Groups annotations by file path for better context
 * - Displays hierarchical information: Stats → Summary → File-by-file feedback
 * - Responsive design with clean developer aesthetics
 */
const PRAnalysisReport = () => {
  const { analysisId, projectId, projectName, teamId } = useParams();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);

  /**
   * Fetch PR analysis data on component mount
   */
  useEffect(() => {
    fetchAnalysisData();
  }, [analysisId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPRAnalysisById(analysisId);

      if (response.isSuccess && response.analysis) {
        setAnalysis(response.analysis);

        // Parse the stringified JSON feedback
        const parsedFeedback = parseDetailedFeedback(response.analysis.aiDetailedFeedback);
        setFeedbackData(parsedFeedback);
      } else {
        setError('Failed to load analysis data');
      }
    } catch (err) {
      console.error('Error fetching PR analysis:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Parse the aiDetailedFeedback JSON string into an array
   * @param {string} feedbackJson - Stringified JSON array
   * @returns {Array} Parsed annotation objects
   */
  const parseDetailedFeedback = (feedbackJson) => {
    try {
      if (!feedbackJson) return [];
      const parsed = JSON.parse(feedbackJson);
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => ({
        ...item,
        codeSnippet: item?.codeSnippet ?? item?.code ?? '',
        displayPath: item?.path || 'Unknown File'
      }));
    } catch (e) {
      console.error('Failed to parse detailed feedback:', e);
      return [];
    }
  };

  /**
   * Group annotations by file path
   * Returns: { "path/to/file.js": [annotation1, annotation2], ... }
   */
  const groupedByFile = useMemo(() => {
    const groups = {};

    feedbackData.forEach((annotation) => {
      const path = annotation.displayPath || annotation.path || 'Unknown File';
      if (!groups[path]) {
        groups[path] = [];
      }
      groups[path].push(annotation);
    });

    return groups;
  }, [feedbackData]);

  /**
   * Navigation handlers
   */
  const handleBack = () => {
    localStorage.setItem('currentProjectContext', JSON.stringify({ projectId, teamId, projectName }));
    navigate(`/student/project/team-workspace?tab=ai-review`);
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Analysis...</h3>
          <p className="text-sm text-gray-600">Fetching AI code review details</p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to AI Code Review
          </button>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 shadow-md">
            <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold text-red-900 mb-3">Error Loading Analysis</h3>
            <p className="text-red-700 leading-relaxed">{error || 'Analysis not found'}</p>
            <button
              onClick={fetchAnalysisData}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with PR Information */}
      <AnalysisHeader analysis={analysis} />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to AI Code Review
        </button>

        {/* Statistics Overview Cards */}
        <StatsOverview analysis={analysis} />

        {/* AI Summary Section */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-8 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI Summary</h2>
          </div>
          <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
            {analysis.aiSummary || 'No summary available.'}
          </p>
        </div>

        {/* File-by-File Feedback Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileCode className="w-7 h-7 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Detailed Code Review
              </h2>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-bold">
                {Object.keys(groupedByFile).length} {Object.keys(groupedByFile).length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {feedbackData.length} total {feedbackData.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>

          {/* Render File Cards */}
          {Object.keys(groupedByFile).length === 0 ? (
            <div className="bg-white border-2 border-green-200 rounded-xl p-12 text-center shadow-md">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Issues Found! 🎉</h3>
              <p className="text-gray-600">
                This pull request looks great. The AI found no bugs, security issues, or improvements.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByFile)
                .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
                .map(([filePath, annotations]) => (
                  <FeedbackThread
                    key={filePath}
                    filePath={filePath}
                    annotations={annotations}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRAnalysisReport;
