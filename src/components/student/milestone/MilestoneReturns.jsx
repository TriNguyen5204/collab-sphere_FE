import React from 'react';
import { Download } from 'lucide-react';

const MilestoneReturns = ({ returns = [] }) => {
  if (!returns || returns.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Submissions</h3>
      <div className="space-y-3">
        {returns.map((r) => (
          <div key={r.id} className="flex items-center justify-between border rounded-lg p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{r.path?.split('/').pop() || 'Submission'}</p>
              <p className="text-xs text-gray-500">
                {r.type}
                {r.student?.name ? ` • ${r.student.name}` : ''}
                {r.submittedAt ? ` • ${new Date(r.submittedAt).toLocaleString()}` : ''}
              </p>
            </div>
            {r.path && (
              <a
                href={r.path}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
              >
                <Download size={16} />
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MilestoneReturns;
