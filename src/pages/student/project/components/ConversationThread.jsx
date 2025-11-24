import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import Annotation from './Annotation';

/**
 * @typedef {import('./Annotation').AnnotationItem} AnnotationItem
 */

/**
 * @typedef {Object} FileGroup
 * @property {string} filePath
 * @property {AnnotationItem[]} annotations
 */

/**
 * @param {{ aiSummary?: string, files: FileGroup[], totalIssues: number }} props
 */
const normalizePathToAnchor = path =>
  path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 64);

const ConversationThread = ({ aiSummary, files, totalIssues }) => {
  const anchoredFiles = useMemo(() => {
    const used = new Set();
    return files.map(file => {
      const base = normalizePathToAnchor(file.filePath || 'file');
      let anchor = base || 'file';
      let attempt = 1;
      while (used.has(anchor)) {
        anchor = `${base}-${attempt}`;
        attempt += 1;
      }
      used.add(anchor);
      return { ...file, anchor };
    });
  }, [files]);

  const [expandedMap, setExpandedMap] = useState({});

  useEffect(() => {
    setExpandedMap(prev => {
      const next = {};
      anchoredFiles.forEach(file => {
        next[file.anchor] = prev[file.anchor] ?? true;
      });
      return next;
    });
  }, [anchoredFiles]);

  const handleJump = useCallback(anchorId => {
    if (typeof window === 'undefined') return;
    const target = document.getElementById(anchorId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const toggleFile = useCallback(anchorId => {
    setExpandedMap(prev => ({
      ...prev,
      [anchorId]: !prev[anchorId]
    }));
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-gray-900">AI Summary</h2>
        <p className="mt-2 text-base leading-relaxed text-gray-700">
          {aiSummary || 'No summary available for this analysis.'}
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Detailed Code Review</p>
            <h3 className="text-2xl font-semibold text-gray-900">
              {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} flagged
            </h3>
          </div>
          <span className="text-sm text-gray-500">{files.length} files affected</span>
        </div>

        {files.length > 1 && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Files overview</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {anchoredFiles.map(file => (
                <button
                  key={`overview-${file.anchor}`}
                  type="button"
                  onClick={() => handleJump(file.anchor)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
                >
                  <span className="font-mono">{file.filePath}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    {file.annotations.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-12">
          {anchoredFiles.map((file, fileIndex) => (
            <article id={file.anchor} key={file.filePath}>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3 text-sm font-mono text-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleFile(file.anchor)}
                    className="inline-flex items-center gap-2 text-left text-gray-800 hover:text-gray-900"
                  >
                    {expandedMap[file.anchor] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <FileCode className="h-4 w-4 text-gray-500" />
                    {file.filePath}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>File {fileIndex + 1} of {files.length}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {file.annotations.length} {file.annotations.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
              </header>

              {expandedMap[file.anchor] && (
                <div className="mt-6 space-y-10">
                  {file.annotations.map((annotation, index) => (
                    <div key={`${file.filePath}-${index}`} className="relative flex gap-6">
                      <div className="flex w-10 flex-col items-center text-xs font-semibold text-gray-500">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white">
                          {index + 1}
                        </span>
                        {index < file.annotations.length - 1 && (
                          <span className="mt-1 h-full w-px bg-gray-200" aria-hidden>
                            &nbsp;
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Annotation annotation={annotation} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConversationThread;
