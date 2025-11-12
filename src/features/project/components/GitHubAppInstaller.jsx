import React, { useEffect, useState } from 'react';
import { CheckCircle, GitBranch, Sparkles, ExternalLink, Settings } from 'lucide-react';
import apiClient from '../../../services/apiClient';

/**
 * GitHubAppInstaller Component
 * 
 * Displays GitHub App installation status and provides installation action
 * for CollabSphere AI Reviewer integration with project repositories.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectId - The ID of the current project
 */
const GitHubAppInstaller = ({ projectId, projectName, teamId }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // GitHub App configuration from environment
  const GITHUB_APP_NAME = import.meta.env.VITE_GITHUB_APP_NAME || 'collabsphere-ai-reviewer';
  
  /**
   * Check if GitHub App is already installed for this project
   * NOTE: This currently checks Azure backend. 
   * TODO: Implement proper installation check via AWS Lambda or Azure backend
   */
  useEffect(() => {
    const checkInstallation = async () => {
      if (!projectId || !teamId) {
        setIsInstalled(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get(`/project/${projectId}/installation`);
        const installations = response.data?.paginatedInstalls?.list ?? [];
        const teamHasInstallation = installations.some((installation) => {
          const installationTeamId = installation?.teamId ?? installation?.team_id;
          return Number(installationTeamId) === Number(teamId);
        });

        setIsInstalled(teamHasInstallation);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setIsInstalled(false);
        } else {
          console.error('Installation check failed:', err);
          setError('Failed to check installation status. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkInstallation();
  }, [projectId, teamId]);

  /**
   * Initiates GitHub App installation flow
   * Saves projectId to localStorage, then redirects to GitHub installation page
   * GitHub will redirect back via "Setup URL" configured in GitHub App settings
   */
  const handleInstallClick = () => {
    const installationContext = {
      projectId,
      projectName,
      teamId,
      redirectPath: window.location.pathname,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('github_installation_context', JSON.stringify(installationContext));
    localStorage.setItem('github_installation_project_id', projectId);
    
    // Redirect to GitHub App installation page
    // No need for redirect_url parameter - using Setup URL in GitHub App settings instead
    const installUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;
    
    console.log('Redirecting to GitHub App installation:', {
      installUrl,
      projectIdSaved: projectId
    });
    
    window.location.href = installUrl;
  };

  /**
   * Navigate to GitHub App settings for management
   */
  const handleManageClick = () => {
  window.open('https://github.com/settings/installations', '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Checking installation status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Installation Check Failed</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Not installed - Show installation prompt
  if (!isInstalled) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-8 border-2 border-blue-200">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enable AI-Powered Code Analysis
          </h2>

          {/* Description */}
          <p className="text-gray-700 mb-6 max-w-2xl leading-relaxed">
            Install our AI assistant to receive constructive, detailed feedback on every pull request. The AI automatically reviews code, detects potential bugs, and suggests quality improvements.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 w-full max-w-2xl">
            <div className="flex items-start gap-2 text-left">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Automated pull request reviews</span>
            </div>
            <div className="flex items-start gap-2 text-left">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Potential bug detection</span>
            </div>
            <div className="flex items-start gap-2 text-left">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Code quality suggestions</span>
            </div>
            <div className="flex items-start gap-2 text-left">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">Seamless GitHub integration</span>
            </div>
          </div>

          {/* Install Button */}
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <GitBranch className="w-5 h-5" />
            <span>Connect & Install AI Reviewer</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Info Note */}
          <p className="mt-4 text-xs text-gray-500">
            You will be redirected to GitHub to grant access. The installation is secure and can be revoked at any time.
          </p>
        </div>
      </div>
    );
  }

  // Already installed - Show success state
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
      <div className="flex items-start gap-4">
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            AI Reviewer is active
          </h3>
          <p className="text-gray-700 mb-4">
            The AI assistant is running and ready to review your code. Every new pull request will be analysed automatically and receive detailed feedback.
          </p>

          {/* Manage Button */}
          <button
            onClick={handleManageClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Manage installation</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubAppInstaller;
