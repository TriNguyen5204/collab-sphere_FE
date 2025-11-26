import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import { handleCallback } from '../../../services/githubApi';

const GitHubAppCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing installation...');
  const [errorDetails, setErrorDetails] = useState(null);
  const [installContext, setInstallContext] = useState(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processInstallation = async () => {
      if (hasProcessedRef.current) {
        return;
      }
      hasProcessedRef.current = true;

      try {
        const installationId = searchParams.get('installation_id');
        const state = searchParams.get('state');
        const setupAction = searchParams.get('setup_action');

        if (!installationId) {
          setStatus('error');
          setMessage('Installation ID not found');
          setErrorDetails('GitHub did not return an installation ID. Please try again.');
          return;
        }

        // Handle missing state parameter
        if (!state) {
          if (setupAction === 'update') {
            setStatus('success');
            setMessage('GitHub settings updated.');
            setTimeout(() => navigate('/student/projects'), 1500);
            return;
          }
          
          setStatus('error');
          setMessage('Invalid Connection Request');
          setErrorDetails('Missing security token (state). Please try connecting again from the Project Workspace.');
          return;
        }

        setMessage('Finalizing setup with GitHub...');
        
        // Call the new backend API to handle the callback
        const response = await handleCallback(installationId, state);

        if (response && response.success) {
          setStatus('success');
          setMessage('Successfully connected to GitHub!');
          
          // Retrieve redirect path from localStorage if available
          const rawContext = localStorage.getItem('github_installation_context');
          let redirectPath = '/student/projects'; // Default fallback
          
          if (rawContext) {
            try {
              const context = JSON.parse(rawContext);
              if (context.redirectPath) {
                redirectPath = context.redirectPath;
              }
              // Clean up localStorage
              localStorage.removeItem('github_installation_context');
              localStorage.removeItem('github_installation_project_id');
            } catch (e) {
              console.warn('Failed to parse context', e);
            }
          }

          setTimeout(() => {
            navigate(redirectPath);
          }, 1500);
        } else {
          throw new Error(response?.message || 'Failed to complete GitHub connection');
        }

      } catch (error) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage('Connection Failed');
        setErrorDetails(error.message || 'An unexpected error occurred while connecting to GitHub.');
      }
    };

    processInstallation();
  }, [navigate, searchParams]);

  /**
   * Render loading state
   */
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <Loader className="w-16 h-16 text-blue-600 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing installation...
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render success state
   */
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {message}
            </h2>
            <p className="text-gray-600 mb-6">
              The GitHub App is now installed and registered. The AI reviewer will automatically analyse pull requests for this project.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Redirecting you back to the project...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {message}
            </h2>
            {errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  {typeof errorDetails === 'string' && errorDetails.trim().startsWith('{') ? (
                    <pre className="text-xs text-red-800 text-left whitespace-pre-wrap break-words">
                      {errorDetails}
                    </pre>
                  ) : (
                    <p className="text-sm text-red-800 text-left">{errorDetails}</p>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                if (installContext?.redirectPath) {
                  navigate(installContext.redirectPath);
                  return;
                }

                if (installContext?.projectId && installContext?.projectName && installContext?.teamId) {
                  localStorage.setItem('currentProjectContext', JSON.stringify({
                    projectId: installContext.projectId,
                    teamId: installContext.teamId,
                    projectName: installContext.projectName
                  }));
                  navigate('/student/project/team-workspace');
                  return;
                }

                navigate('/student/projects');
              }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Return to project page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GitHubAppCallback;
