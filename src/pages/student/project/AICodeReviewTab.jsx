import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, Settings, AlertCircle, Github } from 'lucide-react';
import apiClient from '../../../services/apiClient';

const AICodeReviewTab = ({ projectId, teamId, projectName }) => {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState(null);

  // Check connection status when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      if (!projectId || !teamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/project/${projectId}/installation`);
        const installations = response.data?.paginatedInstalls?.list || [];
        
        // Find installation matching current teamId
        const teamInstallation = installations.find((inst) => {
          const instTeamId = inst?.teamId ?? inst?.team_id;
          return Number(instTeamId) === Number(teamId);
        });
        
        if (teamInstallation) {
          setIsConnected(true);
          setConnectionInfo(teamInstallation);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error('Failed to check GitHub connection:', err);
        const status = err?.response?.status;
        if (status === 404) {
          // No installations found - this is normal for first time
          setIsConnected(false);
        } else {
          setError('Failed to check connection status. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, [projectId, teamId]);

  // Handler when user clicks "Connect GitHub Repository"
  const handleConnectClick = () => {
    setShowConnectModal(true);
  };

  // Handler when user confirms modal and redirects to GitHub
  const handleConfirmConnect = () => {
    const GITHUB_APP_NAME = import.meta.env.VITE_GITHUB_APP_NAME || 'collabsphere-ai-reviewer';
    
    // Save context to localStorage for callback page
    const context = {
      projectId,
      teamId,
      projectName,
      redirectPath: window.location.pathname,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('github_installation_context', JSON.stringify(context));
    localStorage.setItem('github_installation_project_id', projectId);
    
    console.log('Redirecting to GitHub App installation:', {
      context,
      installUrl: `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`,
    });
    
    // Redirect to GitHub App installation page
    window.location.href = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;
  };

  // Handler to manage GitHub App settings
  const handleManageClick = () => {
    window.open('https://github.com/settings/installations', '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading connection status...</span>
      </div>
    );
  }

  // Error state
  if (error && !isConnected) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Failed to load connection status</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State: Not connected
  if (!isConnected) {
    return (
      <>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <Github className="w-12 h-12 text-gray-700" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Get AI-powered feedback on every Pull Request
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Our AI assistant automatically reviews code, detects bugs, and suggests improvements 
            right on your GitHub PRs. Your entire team will see the feedback instantly.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Automated PR reviews</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Best practice suggestions</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Bug detection</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Code quality insights</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleConnectClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Github className="w-5 h-5" />
            Connect GitHub Repository
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Help Text */}
          <p className="mt-6 text-xs text-gray-500">
            You'll be redirected to GitHub to grant access. The process is secure and can be revoked anytime.
          </p>
        </div>

        {/* Confirmation Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Connect Your Team's GitHub Repository
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You'll be redirected to GitHub to:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 mb-6">
                <li>Install the CollabSphere AI Reviewer app</li>
                <li>Grant access to your team's repository</li>
              </ol>
              <p className="text-sm text-gray-600 mb-6">
                Your team members will automatically see AI analysis on all Pull Requests.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConnect}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Continue to GitHub →
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Active State: Connected
  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span>Connected to GitHub</span>
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                AI Reviewer is active and monitoring your Pull Requests
              </p>
              <div className="text-xs text-gray-600">
                Installation ID: {connectionInfo?.githubInstallationId || connectionInfo?.installationId}
                {connectionInfo?.installedAt && (
                  <span className="ml-2">
                    • Connected on {new Date(connectionInfo.installedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleManageClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* PR Analysis Dashboard - Placeholder for future implementation */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          Recent Pull Request Analysis
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Feature coming soon</p>
            <p>
              We're working on displaying PR analysis results here. For now, all AI feedback 
              is posted directly on your GitHub Pull Requests.
            </p>
            <p className="mt-2">
              To see AI reviews, visit your repository on GitHub and check the comments on your Pull Requests.
            </p>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How AI Code Review Works
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
              1
            </div>
            <p>Create or update a Pull Request in your GitHub repository</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
              2
            </div>
            <p>GitHub automatically notifies our AI system via webhook</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
              3
            </div>
            <p>AI analyzes the code changes, checking for bugs, best practices, and improvements</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
              4
            </div>
            <p>AI posts detailed feedback directly as comments on your Pull Request</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICodeReviewTab;
