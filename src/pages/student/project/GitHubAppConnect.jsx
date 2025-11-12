import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import StudentLayout from '../../../components/layout/StudentLayout';

const GitHubAppConnect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/student/projects');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRedirect = () => {
    navigate('/student/projects');
  };

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">This Page Has Moved</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The GitHub connection feature is now integrated into your Team Workspace! 
            Go to your project Team Workspace and click the AI Code Review tab to connect your repository.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-2">How to connect:</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Go to your Projects page</li>
              <li>Select a project and open Team Workspace</li>
              <li>Click on the AI Code Review tab</li>
              <li>Click Connect GitHub Repository</li>
            </ol>
          </div>
          <button
            onClick={handleRedirect}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Go to Projects
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-4 text-xs text-gray-500">Redirecting automatically in 5 seconds...</p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default GitHubAppConnect;
