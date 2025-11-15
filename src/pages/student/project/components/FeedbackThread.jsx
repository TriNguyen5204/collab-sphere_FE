import React, { useState } from 'react';
import { FileCode, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import CodeAnnotation from './CodeAnnotation';

/**
 * FeedbackThread Component
 * Container for all feedback related to a single file
 * Displays file path and a list of code annotations in a conversation-style thread
 * 
 * @param {Object} props
 * @param {string} props.filePath - The file path (e.g., "src/components/Login.js")
 * @param {Array} props.annotations - Array of annotation objects for this file
 * @param {Object} props.codeContent - Optional: Object mapping line numbers to actual code
 */
const FeedbackThread = ({ filePath, annotations, codeContent }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * Count annotations by severity level
   */
  const severityCounts = annotations.reduce((acc, annotation) => {
    const level = annotation.annotation_level || 'notice';
    acc[level] = (acc[level] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { failure: 0, warning: 0, notice: 0, total: 0 });

  /**
   * Get severity badge styling
   */
  const getSeverityBadge = (level, count) => {
    if (count === 0) return null;

    const styles = {
      failure: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      notice: 'bg-blue-600 text-white'
    };

    const labels = {
      failure: 'Critical',
      warning: 'Warning',
      notice: 'Info'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${styles[level]}`}>
        {count} {labels[level]}
      </span>
    );
  };

  /**
   * Get file extension for icon color
   */
  const getFileIconColor = () => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const colorMap = {
      'js': 'text-yellow-500',
      'jsx': 'text-blue-500',
      'ts': 'text-blue-600',
      'tsx': 'text-blue-600',
      'py': 'text-green-600',
      'java': 'text-red-600',
      'css': 'text-purple-500',
      'html': 'text-orange-500',
      'json': 'text-gray-600',
    };
    return colorMap[ext] || 'text-gray-500';
  };

  return (
    <div className="bg-gray-50/50 border-2 border-gray-300 rounded-xl shadow-lg overflow-hidden mb-6 transition-all duration-200 hover:shadow-xl">
      {/* THREAD HEADER */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 hover:bg-white/50 transition-colors duration-150 group"
        >
          <div className="flex items-center justify-between">
            {/* Left Side: File Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Expand/Collapse Icon */}
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                )}
              </div>

              {/* File Icon */}
              <FileCode className={`w-6 h-6 ${getFileIconColor()} flex-shrink-0`} />

              {/* File Path */}
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-mono text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {filePath}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {severityCounts.total} {severityCounts.total === 1 ? 'issue' : 'issues'} found
                </p>
              </div>
            </div>

            {/* Right Side: Severity Badges */}
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {getSeverityBadge('failure', severityCounts.failure)}
              {getSeverityBadge('warning', severityCounts.warning)}
              {getSeverityBadge('notice', severityCounts.notice)}
              
              {/* Total Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                {severityCounts.total}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* THREAD BODY - Annotations List */}
      {isExpanded && (
        <div className="p-6 bg-white space-y-4">
          {annotations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No Issues Found
              </h4>
              <p className="text-sm text-gray-600">
                This file looks great! The AI found no problems.
              </p>
            </div>
          ) : (
            <>
              {/* Thread Introduction */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      Code Review Feedback Thread
                    </h4>
                    <p className="text-xs text-gray-600">
                      AI has identified {severityCounts.total} potential {severityCounts.total === 1 ? 'issue' : 'issues'} in this file.
                      Review each annotation below with its code context.
                    </p>
                  </div>
                </div>
              </div>

              {/* Annotations */}
              <div className="space-y-4">
                {annotations.map((annotation, index) => (
                  <div key={index} className="relative">
                    {/* Thread Connector Line (Visual Guide) */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-2 w-0.5 h-2 bg-gray-300"></div>
                    )}
                    
                    {/* Annotation Number Badge */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 pt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <CodeAnnotation
                          annotation={annotation}
                          codeSnippet={annotation.codeSnippet || annotation.code || codeContent?.[annotation.start_line]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Thread Footer */}
      {isExpanded && annotations.length > 0 && (
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-300">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>End of review thread for {filePath}</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Collapse thread
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackThread;
