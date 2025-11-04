import React, { useCallback, useMemo, useState } from 'react';
import { analyzePullRequest } from '../../../../ai/services/aiService';

const severityConfig = {
  notice: { label: 'Info', tone: 'text-[#2f6cb9]', chip: 'bg-[#d4e3f8] text-[#2f6cb9]', icon: 'ℹ' },
  warning: { label: 'Warning', tone: 'text-[#c48612]', chip: 'bg-[#ffe7b3] text-[#a46c0a]', icon: '⚠' },
  failure: { label: 'Failed', tone: 'text-[#b53f3f]', chip: 'bg-[#fde0e0] text-[#b53f3f]', icon: '✖' },
  success: { label: 'Passed', tone: 'text-[#3a7c55]', chip: 'bg-[#dcefe3] text-[#3a7c55]', icon: '✔' },
};

const summaryStripPalette = {
  success: { bg: 'bg-[#dcefe3]', text: 'text-[#3a7c55]', icon: '✔ Security Check: Passed' },
  warning: { bg: 'bg-[#fff3cd]', text: 'text-[#b2871b]', icon: '⚠ Performance: Warning' },
  failure: { bg: 'bg-[#fde0e0]', text: 'text-[#b53f3f]', icon: '✖ Style Guide: Failed' },
};

const parseDiff = (diff) => {
  if (!diff) return [];
  const lines = diff.split('\n');
  let oldLine = 0;
  let newLine = 0;
  return lines.map((line, index) => {
    if (line.startsWith('@@')) {
      const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match) {
        oldLine = Number(match[1]);
        newLine = Number(match[2]);
      }
      return { key: `meta-${index}`, line, type: 'meta', oldLine: '', newLine: '' };
    }

    if (line.startsWith('+')) {
      newLine += 1;
      return { key: `add-${index}`, line, type: 'add', oldLine: '', newLine };
    }

    if (line.startsWith('-')) {
      oldLine += 1;
      return { key: `remove-${index}`, line, type: 'remove', oldLine, newLine: '' };
    }

    oldLine += 1;
    newLine += 1;
    return { key: `context-${index}`, line, type: 'context', oldLine, newLine };
  });
};

const inferSummaryGrade = (analysis) => {
  if (!analysis) return 'B+';
  if (analysis.grade) return analysis.grade;
  if (analysis.score) {
    if (analysis.score >= 90) return 'A';
    if (analysis.score >= 80) return 'B+';
    if (analysis.score >= 70) return 'B';
    return 'C';
  }
  return 'B+';
};

const buildSummaryStrips = (analysis) => {
  if (!analysis) {
    return [summaryStripPalette.success, summaryStripPalette.warning, summaryStripPalette.failure];
  }

  const annotations = Array.isArray(analysis.annotations) ? analysis.annotations : [];
  const groups = { success: [], warning: [], failure: [] };

  annotations.forEach((annotation) => {
    const level = annotation.annotation_level?.toLowerCase();
    if (level === 'warning') {
      groups.warning.push(annotation.message || annotation.title);
    } else if (level === 'failure' || level === 'error') {
      groups.failure.push(annotation.message || annotation.title);
    } else {
      groups.success.push(annotation.message || annotation.title);
    }
  });

  const strips = [];
  if (groups.success.length) strips.push(summaryStripPalette.success);
  if (groups.warning.length) strips.push(summaryStripPalette.warning);
  if (groups.failure.length) strips.push(summaryStripPalette.failure);
  if (!strips.length) strips.push(summaryStripPalette.success);
  return strips;
};

const PRAnalysisView = () => {
  const [diffContent, setDiffContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeAnnotation, setActiveAnnotation] = useState(null);

  const diffRows = useMemo(() => parseDiff(diffContent), [diffContent]);
  const summaryGrade = useMemo(() => inferSummaryGrade(analysisResult), [analysisResult]);
  const summaryStrips = useMemo(() => buildSummaryStrips(analysisResult), [analysisResult]);

  const highlightedLines = useMemo(() => {
    if (!activeAnnotation) return new Set();
    const start = Number(activeAnnotation.start_line) || 0;
    const end = Number(activeAnnotation.end_line) || start;
    const set = new Set();
    for (let i = start; i <= end; i += 1) set.add(i);
    return set;
  }, [activeAnnotation]);

  const handleAnalyze = useCallback(async () => {
    if (!diffContent.trim()) {
      setError('Please provide the diff content before requesting an analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setActiveAnnotation(null);

    try {
      const response = await analyzePullRequest({ diff: diffContent });
      setAnalysisResult(response);
    } catch (analysisError) {
      setError(analysisError.message || 'Something went wrong while analyzing the pull request.');
    } finally {
      setIsLoading(false);
    }
  }, [diffContent]);

  const handleAnnotationHover = useCallback((annotation) => {
    setActiveAnnotation(annotation);
  }, []);

  const handleAnnotationLeave = useCallback(() => {
    setActiveAnnotation(null);
  }, []);

  const handleScrollToLine = useCallback((annotation) => {
    if (!annotation?.start_line) return;
    const target = document.getElementById(`line-${annotation.start_line}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveAnnotation(annotation);
    }
  }, []);

  const renderDiffLine = (row) => {
    if (row.type === 'meta') {
      return (
        <div
          key={row.key}
          className="rounded-md bg-[#eef2fa] px-3 py-2 text-xs font-mono text-[#3f6aa8]"
        >
          {row.line}
        </div>
      );
    }

    const isHighlightedNew = highlightedLines.has(row.newLine);
    const baseLineClass = {
      add: 'bg-[#e6f3eb] text-[#24723f]',
      remove: 'bg-[#fae5e5] text-[#b53f3f]',
      context: 'text-[#3a4251]',
    }[row.type];

    return (
      <div
        key={row.key}
        id={row.newLine ? `line-${row.newLine}` : undefined}
        className={`grid grid-cols-[60px_1fr] gap-3 rounded-lg border border-[#d8dee9] bg-white px-3 py-2 text-sm font-mono ${isHighlightedNew ? 'outline outline-2 outline-[#f1c453]' : ''}`}
      >
        <div className="flex items-center justify-between text-xs text-[#9aa3b5]">
          <span>{row.oldLine || ''}</span>
          <span>{row.newLine || ''}</span>
        </div>
        <pre className={`overflow-x-auto whitespace-pre-wrap leading-relaxed ${baseLineClass}`}>{row.line}</pre>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-4 rounded-lg border border-[#d8dee9] bg-white p-5">
      <div className="h-4 w-32 rounded bg-[#e8edf7]" />
      <div className="h-3 w-24 rounded bg-[#f2f4fa]" />
      <div className="h-[120px] rounded bg-[#f7f9fc]" />
      <div className="h-[120px] rounded bg-[#f7f9fc]" />
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cfd6e4] bg-white text-center">
      <h3 className="text-base font-semibold text-[#3a4251]">Analysis Summary</h3>
      <p className="mt-2 max-w-[220px] text-sm text-[#7b8497]">
        Once you run an analysis, results will appear here.
      </p>
    </div>
  );

  const renderAnalysis = () => {
    if (!analysisResult) {
      return renderEmptyState();
    }

    const summary = analysisResult.summary || 'No summary available for this analysis.';
    const annotations = Array.isArray(analysisResult.annotations) ? analysisResult.annotations : [];

    return (
      <div className="space-y-5">
        <section className="rounded-lg border border-[#d8dee9] bg-white p-5">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7c94]">Analysis Summary</p>
              <p className="mt-2 text-sm text-[#475069]">Total Issues: {annotations.length}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#6f7c94]">Quality</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2f0ff] text-sm font-semibold text-[#1f64b3]">{summaryGrade}</div>
            </div>
          </header>
          <div className="mt-4 space-y-2">
            {summaryStrips.map((strip, index) => (
              <div
                key={`${strip.icon}-${index}`}
                className={`flex items-center justify-between rounded-md border border-[#d2d8e3] px-3 py-2 text-sm ${strip.bg} ${strip.text}`}
              >
                <span>{strip.icon}</span>
                <span>Details</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#56617a]">{summary}</p>
        </section>

        <section className="rounded-lg border border-[#d8dee9] bg-white p-5">
          <header className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6f7c94]">Detailed Annotations</h3>
            <span className="text-xs text-[#98a2b8]">Hover for highlight • Click to jump</span>
          </header>
          <div className="space-y-3">
            {annotations.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#d2d8e3] bg-[#f7f9fc] p-4 text-sm text-[#7b8497]">
                No annotations were returned for this analysis.
              </div>
            ) : (
              annotations.map((annotation, index) => {
                const severity = severityConfig[annotation.annotation_level?.toLowerCase()] || severityConfig.notice;
                const range = annotation.start_line === annotation.end_line || !annotation.end_line
                  ? `Line ${annotation.start_line}`
                  : `Lines ${annotation.start_line}–${annotation.end_line}`;

                return (
                  <article
                    key={`${annotation.title}-${index}`}
                    onMouseEnter={() => handleAnnotationHover(annotation)}
                    onFocus={() => handleAnnotationHover(annotation)}
                    onMouseLeave={handleAnnotationLeave}
                    onBlur={handleAnnotationLeave}
                    className="flex items-start justify-between rounded-lg border border-[#d8dee9] bg-white px-4 py-3 text-sm text-[#475069]"
                  >
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleScrollToLine(annotation)}
                        className="text-left font-semibold text-[#b53f3f] hover:underline"
                      >
                        {range}: {annotation.title || 'Annotation'}
                      </button>
                      <p className="text-xs text-[#6f7c94]">{annotation.message || 'No message provided.'}</p>
                    </div>
                    <span className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium ${severity.chip}`}>{severity.label}</span>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f5f0] py-12">
      <div className="mx-auto max-w-6xl rounded-lg border border-[#d8dee9] bg-white shadow-sm">
        <header className="border-b border-[#d8dee9] px-10 py-6 text-center">
          <h1 className="text-2xl font-semibold text-[#2e3445]">PR Analysis Dashboard</h1>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-[#e5f0fb] py-2 text-[#2f6cb9]">Project: myapp-frontend</div>
            <div className="rounded-md bg-[#e5f0fb] py-2 text-[#2f6cb9]">PR #1234: Add auth</div>
            <div className="rounded-md bg-[#e5f0fb] py-2 text-[#2f6cb9]">Status: In review</div>
          </div>
        </header>

        <main className="grid gap-8 px-10 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            <div className="rounded-lg border border-[#d8dee9] bg-white p-5">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7c94]">Diff Display</p>
                  <p className="mt-1 text-sm text-[#7b8497]">Line numbers • Syntax Highlight • Code Changes • Copy Button</p>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="rounded-md bg-[#2f6cb9] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#255a95] disabled:cursor-not-allowed disabled:bg-[#9fbce4]"
                >
                  {isLoading ? 'Analyzing…' : 'Analyze PR'}
                </button>
              </header>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)]">
                <div>
                  <label htmlFor="diff-input" className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#6f7c94]">
                    Paste PR Diff
                  </label>
                  <textarea
                    id="diff-input"
                    value={diffContent}
                    onChange={(event) => setDiffContent(event.target.value)}
                    placeholder="Paste the full diff content here..."
                    className="mt-2 h-48 w-full resize-none rounded-md border border-[#d8dee9] bg-[#f7f9fc] px-3 py-3 font-mono text-sm text-[#3a4251] focus:border-[#2f6cb9] focus:outline-none"
                  />
                </div>

                <div className="rounded-lg border border-[#d8dee9] bg-white">
                  <div className="flex items-center justify-between border-b border-[#d8dee9] px-4 py-2 text-sm text-[#6f7c94]">
                    <span>Rendered Diff</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(diffContent)}
                      className="rounded-md bg-[#2f6cb9] px-3 py-1 text-xs font-semibold text-white hover:bg-[#255a95]"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="h-80 overflow-auto bg-[#fdfefe] p-4">
                    {diffRows.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-[#98a2b8]">
                        Waiting for diff input…
                      </div>
                    ) : (
                      <div className="space-y-2">{diffRows.map((row) => renderDiffLine(row))}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-[#f5c4c4] bg-[#fdeaea] px-4 py-3 text-sm text-[#b53f3f]">
                {error}
              </div>
            ) : null}
          </section>

          <aside className="space-y-4">
            {isLoading ? renderSkeleton() : renderAnalysis()}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default PRAnalysisView;
