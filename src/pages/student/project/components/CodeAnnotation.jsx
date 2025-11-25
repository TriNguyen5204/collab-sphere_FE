import React from 'react';
import { XCircle, AlertCircle, Lightbulb, Code2 } from 'lucide-react';

/**
 * CodeAnnotation Component
 * Displays a single annotation with an inline code snippet view
 * Two-part layout: Code snippet (top) + Feedback message (bottom)
 * 
 * @param {Object} props
 * @param {Object} props.annotation - Single annotation object
 * @param {string} props.annotation.path - File path
 * @param {number} props.annotation.start_line - Starting line number
 * @param {number} props.annotation.end_line - Ending line number
 * @param {string} props.annotation.annotation_level - Severity: "failure", "warning", or "notice"
 * @param {string} props.annotation.title - Short title of the issue
 * @param {string} props.annotation.message - Detailed explanation
 * @param {string} props.codeSnippet - Optional: actual code content to display
 */
const CodeAnnotation = ({ annotation, codeSnippet }) => {
  const {
    start_line,
    end_line,
    annotation_level = 'notice',
    title,
    message
  } = annotation;

  /**
   * Get severity-based styling configuration
   */
  const getSeverityConfig = (level) => {
    const configs = {
      failure: {
        icon: <XCircle className="w-5 h-5" />,
        iconColor: 'text-red-600',
        borderColor: 'border-l-red-600',
        bgColor: 'bg-red-50',
        headerBg: 'bg-red-100',
        badgeClasses: 'bg-red-600 text-white',
        highlightBg: 'bg-red-900/20',
        label: 'FAILURE'
      },
      warning: {
        icon: <AlertCircle className="w-5 h-5" />,
        iconColor: 'text-yellow-600',
        borderColor: 'border-l-yellow-600',
        bgColor: 'bg-yellow-50',
        headerBg: 'bg-yellow-100',
        badgeClasses: 'bg-yellow-600 text-white',
        highlightBg: 'bg-yellow-900/20',
        label: 'WARNING'
      },
      notice: {
        icon: <Lightbulb className="w-5 h-5" />,
        iconColor: 'text-blue-600',
        borderColor: 'border-l-blue-600',
        bgColor: 'bg-blue-50',
        headerBg: 'bg-blue-100',
        badgeClasses: 'bg-blue-600 text-white',
        highlightBg: 'bg-blue-900/20',
        label: 'NOTICE'
      }
    };

    return configs[level] || configs.notice;
  };

  const config = getSeverityConfig(annotation_level);

  /**
   * Generate line range for display
   */
  const getLineRange = () => {
    if (!start_line) return null;
    if (start_line === end_line || !end_line) {
      return [start_line];
    }
    // Generate array of line numbers in range
    const lines = [];
    for (let i = start_line; i <= end_line; i++) {
      lines.push(i);
    }
    return lines;
  };

  const lineRange = getLineRange();

  const normalizedSnippet =
    typeof codeSnippet === 'string'
      ? codeSnippet
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\\n/g, '\n')
      : '';
  const snippetLines = normalizedSnippet ? normalizedSnippet.split('\n') : [];
  const hasSnippet = snippetLines.length > 0;

  /**
   * Generate placeholder code content
   * In production, this would be replaced with actual code from the file
   */
  const generatePlaceholderCode = (lineNumber) => {
    const placeholders = [
      `  const result = await fetchData();`,
      `  if (result.status === 'success') {`,
      `    GITHUB_TOKEN: \${{ secrets.`,
      `    return processData(result.data);`,
      `  } else {`,
      `    throw new Error('Failed');`,
      `  }`,
      `  console.log('Processing complete');`
    ];
    return placeholders[(lineNumber % placeholders.length)] || '  // Code content';
  };

  const computedLines = hasSnippet
    ? snippetLines.map((content, idx) => ({
        number: typeof start_line === 'number' ? start_line + idx : lineRange?.[idx] ?? idx + 1,
        content: content || ' '
      }))
    : lineRange?.map((lineNumber) => ({
        number: lineNumber,
        content: generatePlaceholderCode(lineNumber)
      })) || [];

  if (!hasSnippet && computedLines.length === 0) {
    computedLines.push({ number: null, content: '// No line information available' });
  }

  return (
    <div className={`border-l-4 ${config.borderColor} rounded-r-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 mb-4`}>
      {/* PART 1: CODE SNIPPET VIEW */}
      <div className="bg-gray-900 text-gray-100 overflow-x-auto">
        {/* Code Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-400">
              Lines {start_line}{end_line && end_line !== start_line ? `-${end_line}` : ''}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.badgeClasses}`}>
            {config.label}
          </span>
        </div>

        {/* Code Lines */}
        <div className="font-mono text-sm">
          {computedLines.map((line, idx) => (
            <div
              key={`${line.number ?? 'unknown'}-${idx}`}
              className={`flex ${config.highlightBg} hover:bg-gray-100 transition-colors`}
            >
              {/* Line Number Gutter */}
              <div className="select-none flex-shrink-0 w-16 px-4 py-2 text-right text-gray-500 bg-gray-50 border-r border-gray-200">
                {typeof line.number === 'number' ? line.number : '--'}
              </div>
              
              {/* Code Content */}
              <div className="flex-1 px-4 py-2 text-gray-200">
                <code>{line.content}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Context Lines Indicator (Optional) */}
        {computedLines.length > 3 && (
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
              </div>
              <span>{computedLines.length} lines affected</span>
            </div>
          </div>
        )}
      </div>

      {/* PART 2: ANNOTATION MESSAGE */}
      <div className={`${config.bgColor} border-t-2 ${config.borderColor}`}>
        {/* Annotation Header */}
        <div className={`${config.headerBg} px-4 py-3 border-b-2 border-white/50`}>
          <div className="flex items-start gap-3">
            <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 break-words leading-tight">
                {title}
              </h4>
            </div>
          </div>
        </div>

        {/* Annotation Body */}
        <div className="px-4 py-4 bg-white">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Annotation Footer (Optional - for future actions) */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            AI-generated feedback
          </div>
          {/* Future: Add reply/dismiss buttons here */}
        </div>
      </div>
    </div>
  );
};

export default CodeAnnotation;
