import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import { AlertCircle, Lightbulb, Octagon } from 'lucide-react';

/**
 * @typedef {Object} AnnotationItem
 * @property {string} [title]
 * @property {string} [message]
 * @property {string} [annotation_level]
 * @property {string} [path]
 * @property {number} [start_line]
 * @property {number} [end_line]
 * @property {string} [codeSnippet]
 */

/**
 * Code-first annotation block used in the conversation feed.
 * @param {{ annotation: AnnotationItem }} props
 */
const Annotation = ({ annotation }) => {
  const {
    title = 'AI Feedback',
    message = 'No additional message provided.',
    annotation_level = 'notice',
    start_line = 1,
    end_line = start_line,
    codeSnippet,
    code
  } = annotation;

  const severity = useMemo(() => {
    const map = {
      failure: {
        color: 'text-red-600',
        border: 'border-red-500',
        accent: 'bg-red-500',
        icon: <Octagon className="h-4 w-4" />,
        label: 'Failure'
      },
      warning: {
        color: 'text-amber-600',
        border: 'border-amber-500',
        accent: 'bg-amber-500',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Warning'
      },
      notice: {
        color: 'text-blue-600',
        border: 'border-blue-500',
        accent: 'bg-blue-500',
        icon: <Lightbulb className="h-4 w-4" />,
        label: 'Notice'
      }
    };
    return map[annotation_level] || map.notice;
  }, [annotation_level]);

  const highlightedLines = useMemo(() => {
    const start = start_line || 1;
    const end = end_line && end_line >= start ? end_line : start;
    const lines = [];
    for (let line = start; line <= end; line += 1) {
      lines.push(line);
    }
    return lines;
  }, [start_line, end_line]);

  const fallbackSnippet = useMemo(() => {
    const snippetSource = typeof codeSnippet === 'string' && codeSnippet.trim().length > 0
      ? codeSnippet
      : typeof code === 'string'
        ? code
        : '';

    if (snippetSource) {
      return snippetSource
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\\n/g, '\n');
    }

    const placeholders = [
      '// Placeholder code snippet',
      'const response = await apiClient.get(url);',
      'if (!response?.data) {',
      "  throw new Error('Missing payload');",
      '}',
      'return transformResponse(response.data);'
    ];
    return placeholders.join('\n');
  }, [codeSnippet, code]);

  const lineProps = lineNumber => ({
    style: highlightedLines.includes(lineNumber + (start_line || 1) - 1)
      ? { backgroundColor: 'rgba(245, 158, 11, 0.15)' }
      : {}
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white text-xs">
        <SyntaxHighlighter
          language="tsx"
          wrapLongLines
          showLineNumbers
          startingLineNumber={start_line || 1}
          style={oneLight}
          customStyle={{ margin: 0, padding: '1.25rem', fontSize: '0.85rem' }}
          lineProps={lineNumber => lineProps(lineNumber)}
        >
          {fallbackSnippet}
        </SyntaxHighlighter>
      </div>

      <div className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${severity.border}`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${severity.accent} text-white`}>
            {severity.icon}
          </span>
          <span>{title}</span>
          <span className={`text-xs uppercase tracking-wide ${severity.color}`}>{severity.label}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Annotation;
