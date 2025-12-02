import React, { useMemo } from 'react';
import { ExternalLink, GitPullRequest, Octagon, AlertCircle, Lightbulb } from 'lucide-react';
import StatCard from './StatCard';

/**
 * @typedef {Object} MetadataSidebarProps
 * @property {Object} analysis
 * @property {Array} annotations
 * @property {number} totalIssues
 * @property {number} filesWithIssues
 */

const severityIconMap = {
  failure: <Octagon className="h-4 w-4" />,
  warning: <AlertCircle className="h-4 w-4" />,
  notice: <Lightbulb className="h-4 w-4" />
};

/**
 * Sticky sidebar summarizing PR metadata and AI signals.
 * @param {MetadataSidebarProps} props
 */
const MetadataSidebar = ({ analysis, annotations = [], totalIssues, filesWithIssues }) => {
  const counts = useMemo(() => {
    return annotations.reduce(
      (acc, item) => {
        const level = (item.annotation_level || 'notice').toLowerCase();
        if (acc[level] !== undefined) {
          acc[level] += 1;
        }
        return acc;
      },
      { failure: 0, warning: 0, notice: 0 }
    );
  }, [annotations]);

  const stats = [
    {
      label: 'Failures',
      value: counts.failure,
      icon: severityIconMap.failure,
      accent: 'text-red-600'
    },
    {
      label: 'Warnings',
      value: counts.warning,
      icon: severityIconMap.warning,
      accent: 'text-amber-600'
    },
    {
      label: 'Notices',
      value: counts.notice,
      icon: severityIconMap.notice,
      accent: 'text-blue-600'
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
