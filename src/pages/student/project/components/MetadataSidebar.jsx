import React, { useMemo } from 'react';
import { ExternalLink, GitPullRequest, Shield, Bug, Lightbulb } from 'lucide-react';
import StatCard from './StatCard';

/**
 * @typedef {Object} MetadataSidebarProps
 * @property {Object} analysis
 * @property {number} totalIssues
 * @property {number} filesWithIssues
 */

const severityIconMap = {
  bugs: <Bug className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  suggestions: <Lightbulb className="h-4 w-4" />
};

/**
 * Sticky sidebar summarizing PR metadata and AI signals.
 * @param {MetadataSidebarProps} props
 */
const MetadataSidebar = ({ analysis, totalIssues, filesWithIssues }) => {
  const score = analysis.aiOverallSCore || analysis.aiOverallScore || 0;

  const scoreMeta = useMemo(() => {
    if (score >= 8) return { color: '#16a34a', label: 'Excellent' };
    if (score >= 5) return { color: '#f97316', label: 'Good' };
    return { color: '#dc2626', label: 'Needs Work' };
  }, [score]);

  const stats = [
    {
      label: 'Bugs',
      value: analysis.aiBugCount || 0,
      icon: severityIconMap.bugs,
      accent: 'text-red-500'
    },
    {
      label: 'Security',
      value: analysis.aiSecurityIssueCount || 0,
      icon: severityIconMap.security,
      accent: 'text-amber-600'
    },
    {
      label: 'Suggestions',
      value: analysis.aiSuggestionCount || 0,
      icon: severityIconMap.suggestions,
      accent: 'text-blue-500'
    }
  ];

  const metadata = [
    { label: 'Author', value: analysis.prAuthorGithubUsername || 'Unknown' },
    {
      label: 'Created',
      value: analysis.prCreatedAt ? new Date(analysis.prCreatedAt).toLocaleString() : 'Unknown'
    },
    { label: 'Status', value: analysis.prState },
    { label: 'Project ID', value: analysis.projectId || '-' },
    { label: 'Team ID', value: analysis.teamId || '-' },
    { label: 'Total Issues', value: totalIssues },
    { label: 'Files Impacted', value: filesWithIssues }
  ];

  return (
    <aside className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm uppercase tracking-wide text-gray-500">Overall Score</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={scoreMeta.color}
                strokeWidth="8"
                strokeDasharray={339.292}
                strokeDashoffset={339.292 - (Math.min(score, 10) / 10) * 339.292}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-gray-900">{score.toFixed(1)}</span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-sm font-medium" style={{ color: scoreMeta.color }}>
          {scoreMeta.label}
        </p>
      </div>

      <div className="space-y-2">
        {stats.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} accent={stat.accent} />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm uppercase tracking-wide text-gray-500">Pull Request</p>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          {metadata.map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
        {analysis.prUrl && (
          <a
            href={analysis.prUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <GitPullRequest className="h-4 w-4" />
          <span>PR #{analysis.prNumber}</span>
        </div>
      </div>
    </aside>
  );
};

export default MetadataSidebar;
