import React from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { PRAnalysisView } from '../../features/student/prAnalysis';

const StudentPRAnalysisPage = () => {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">AI Assistance</p>
          <h1 className="text-3xl font-bold text-slate-900">AI-powered pull request analysis</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Use the AI reviewer to surface risks, highlight impacted areas, and get actionable suggestions in seconds.
            Provide context and change details so the analysis can focus on what matters most.
          </p>
        </header>

        <PRAnalysisView />
      </div>
    </StudentLayout>
  );
};

export default StudentPRAnalysisPage;
