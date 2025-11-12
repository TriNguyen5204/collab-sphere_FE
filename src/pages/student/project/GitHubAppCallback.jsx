import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import apiClient from '../../../services/apiClient';

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

      try {
        // Retrieve projectId from localStorage (saved before redirect to GitHub)
        const rawContext = localStorage.getItem('github_installation_context');
        let parsedContext = null;
        if (rawContext) {
          try {
            parsedContext = JSON.parse(rawContext);
          } catch (parseError) {
            console.warn('Failed to parse GitHub installation context, falling back to legacy key.', parseError);
          }
        }

    const legacyProjectId = localStorage.getItem('github_installation_project_id');
    const projectId = parsedContext?.projectId || legacyProjectId;

        setInstallContext(parsedContext || (legacyProjectId ? { projectId: legacyProjectId } : null));

        if (!projectId) {
          setStatus('error');
          setMessage('Project ID not found');
          setErrorDetails('We could not identify the project to link. Please restart the installation from the project page.');
          return;
        }

        // Validate projectId is a valid number
        const projectIdNumber = Number(projectId);
        if (Number.isNaN(projectIdNumber) || projectIdNumber <= 0) {
          setStatus('error');
          setMessage('Invalid project ID');
          setErrorDetails(`The project ID (${projectId}) is not valid. Please restart the installation from the project page.`);
          return;
        }
        
        // Extract installation_id from URL query params
        const installationId = searchParams.get('installation_id');
        
        if (!installationId) {
          setStatus('error');
          setMessage('Installation ID not found');
          setErrorDetails('GitHub did not return an installation ID. Please try again.');
          return;
        }
        setMessage('Finalizing setup...');

        // Get teamId from parsed context
        const teamId = parsedContext?.teamId;
        
        if (!teamId) {
          setStatus('error');
          setMessage('Team ID not found');
          setErrorDetails('We could not identify the team to link. Please restart the installation from the project page.');
          return;
        }

        const payload = { 
          installationId: Number(installationId),
          teamId: Number(teamId)
        };
        
        if (Number.isNaN(payload.installationId) || payload.installationId <= 0) {
          setStatus('error');
          setMessage('Invalid installation ID');
          setErrorDetails('The installation ID returned by GitHub is not a valid number.');
          return;
        }

        if (Number.isNaN(payload.teamId) || payload.teamId <= 0) {
          setStatus('error');
          setMessage('Invalid team ID');
          setErrorDetails('The team ID is not valid. Please restart the installation from the project page.');
          return;
        }

        console.log('[GitHubAppCallback] POST /project/%s/installation', projectIdNumber, 'body:', payload);

        const response = await apiClient.post(`/project/${projectIdNumber}/installation`, payload);
        console.log('[GitHubAppCallback] Installation API response:', response);

  hasProcessedRef.current = true;

        setStatus('success');
        setMessage('Installation successful!');

        localStorage.removeItem('github_installation_context');
        localStorage.removeItem('github_installation_project_id');
        
        setTimeout(() => {
          if (parsedContext?.projectId && parsedContext?.teamId && parsedContext?.projectName) {
            navigate(
              `/student/project/${parsedContext.projectId}/${parsedContext.projectName}/${parsedContext.teamId}/team-workspace?tab=ai-review&firstConnect=true`
            );
            return;
          }
          const redirectPath = parsedContext?.redirectPath;
          if (redirectPath) {
            navigate(redirectPath);
            return;
          }

          navigate('/student/projects');
        }, 3000);

      } catch (error) {
        console.error('Error processing installation:', error);
        
        // Clean up localStorage on error
        localStorage.removeItem('github_installation_context');
        localStorage.removeItem('github_installation_project_id');
        
        setStatus('error');
        setMessage('An error occurred');

        if (error?.response) {
          const formatted = {
            status: error.response.status,
            message: error.response.data?.message || error.message,
            data: error.response.data,
          };
          setErrorDetails(JSON.stringify(formatted, null, 2));
        } else {
          setErrorDetails(error?.message || 'Unknown error. Please check the console for more details.');
        }
      }
    };

    processInstallation();
  }, [searchParams, navigate]); // Removed projectId from dependency array

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
                  navigate(`/student/project/${installContext.projectId}/${installContext.projectName}/${installContext.teamId}/team-workspace`);
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
