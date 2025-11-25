import React from 'react';
import { User, Calendar, ExternalLink, GitPullRequest } from 'lucide-react';

/**
 * AnalysisHeader Component
 * Displays the main pull request information with professional GitHub-style layout
 * 
 * @param {Object} props
 * @param {Object} props.analysis - The PR analysis data
 * @param {string} props.analysis.prTitle - Pull request title
 * @param {string} props.analysis.prState - PR state: "open" or "closed"
 * @param {string} props.analysis.prAuthorGithubUsername - GitHub username of PR author
 * @param {string} props.analysis.prCreatedAt - ISO date string of PR creation
 * @param {string} props.analysis.prUrl - GitHub URL to the pull request
 */
const AnalysisHeader = ({ analysis }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStateBadge = () => {
    if (analysis.prState === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border border-green-300 text-green-800 text-sm font-semibold rounded-full">
          <GitPullRequest className="w-4 h-4" />
          Open
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 border border-purple-300 text-purple-800 text-sm font-semibold rounded-full">
        <GitPullRequest className="w-4 h-4" />
        {analysis.prState === 'merged' ? 'Merged' : 'Closed'}
      </span>
    );
  };

  return (
    <div className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 break-words">
                {analysis.prTitle}
              </h1>
              {getStateBadge()}
            </div>
          </div>
          
          {/* View on GitHub Button */}
          <a
            href={analysis.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 transition-colors duration-200 shadow-sm hover:bg-gray-50"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">{analysis.prAuthorGithubUsername}</span>
            <span className="text-gray-500">opened this pull request</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <time className="text-gray-700 font-medium">
              {formatDate(analysis.prCreatedAt)}
            </time>
          </div>

          {analysis.prNumber && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">PR</span>
              <span className="font-mono font-semibold text-gray-700">
                #{analysis.prNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHeader;
