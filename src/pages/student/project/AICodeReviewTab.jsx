import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  CheckCircle,
  CheckCircle2,
  Settings,
  AlertCircle,
  Github,
  GitPullRequest,
  Clock,
  Bug,
  ShieldAlert,
  Lightbulb,
  ArrowUpRight,
  RefreshCcw
} from 'lucide-react';
import { getPRAnalysesByTeam } from '../../../services/prAnalysisApi';
import { initConnection, getProjectInstallation } from '../../../services/githubApi';
import { toast } from 'sonner';

const AICodeReviewTab = ({ projectId, teamId, projectName }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState(null);
  const [prAnalyses, setPrAnalyses] = useState([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [analysesError, setAnalysesError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use new API to get project specific installations
        const response = await getProjectInstallation(projectId);
        const installations = response?.installations || [];
        
        // Filter for the current team
        const teamInstallation = installations.find(inst => Number(inst.teamId) === Number(teamId));
        
        if (teamInstallation && teamInstallation.repositories && teamInstallation.repositories.length > 0) {
          const repos = teamInstallation.repositories;
          console.log('Connected Repositories for Team:', repos);
          
          setIsConnected(true);
          setConnectionInfo({
            repositories: repos,
            teamId: teamInstallation.teamId
          });
        } else {
          setIsConnected(false);
          setConnectionInfo(null);
        }
      } catch (err) {
        console.error('Failed to check GitHub connection:', err);
        
        if (err.response?.status === 500) {
          const errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : 'Internal Server Error';
          setError(errorMessage);
        } else if (err.response?.status !== 404) {
          setError('Failed to check connection status.');
        }

        setIsConnected(false);
        setConnectionInfo(null);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, [projectId, teamId]);

  const fetchPRAnalyses = useCallback(async () => {
    if (!connectionInfo?.repositories?.length) {
      return;
    }

    try {
      setLoadingAnalyses(true);
      setAnalysesError(null);

      const promises = connectionInfo.repositories.map(async (repo) => {
        // Support multiple property names for ID
        const repositoryId = repo?.repositoryId ?? repo?.repository_id ?? repo?.id;
        const repositoryName = repo?.repositoryFullName ?? repo?.repository_full_name ?? repo?.full_name ?? repo?.name;
        
        if (!repositoryId) return [];

        try {
          const response = await getPRAnalysesByTeam(teamId, repositoryId);
          const analyses = normalizeAnalysesResponse(response);
          
          // Attach repository info to each analysis to ensure we can distinguish them in UI
          return analyses.map(analysis => ({
            ...analysis,
            repositoryFullName: analysis.repositoryFullName || repositoryName,
            repositoryId: analysis.repositoryId || repositoryId
          }));
        } catch (err) {
          console.warn(`Failed to fetch analyses for repo ${repositoryId}:`, err);
          return [];
        }
      });

      const results = await Promise.all(promises);
      const allAnalyses = results.flat();

      // Sort by date descending (newest first)
      allAnalyses.sort((a, b) => {
        const dateA = new Date(a.analyzedAt || a.analyzeAt || 0);
        const dateB = new Date(b.analyzedAt || b.analyzeAt || 0);
        return dateB - dateA;
      });

      console.log('Fetched All PR Analyses:', allAnalyses);
      setPrAnalyses(allAnalyses);
    } catch (err) {
      console.error('Unable to fetch PR analyses:', err);
      setAnalysesError('Unable to fetch PR analyses.');
    } finally {
      setLoadingAnalyses(false);
    }
  }, [connectionInfo, teamId]);

  useEffect(() => {
    if (isConnected && connectionInfo?.repositories?.length) {
      fetchPRAnalyses();
    }
  }, [isConnected, connectionInfo, fetchPRAnalyses]);

  const handleConnectClick = () => {
    setShowConnectModal(true);
  };

  const handleConfirmConnect = async () => {
    try {
      setConnecting(true);
      // Save context for callback page to redirect back
      const context = {
        projectId,
        teamId,
        projectName,
        redirectPath: window.location.pathname,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('github_installation_context', JSON.stringify(context));
      
      const response = await initConnection(projectId, teamId);
      console.log('GitHub Connection Init Response:', response);

      // Support different response structures
      const connectionUrl = response?.generatedUrl || response?.url || response?.result?.url || response?.data?.url;

      if (connectionUrl) {
        window.location.href = connectionUrl;
      } else {
        console.error('URL not found in response:', response);
        toast.error(response?.message || 'Failed to get GitHub connection URL');
      }
    } catch (error) {
      console.error('Failed to initiate GitHub connection:', error);
      toast.error('Failed to initiate GitHub connection');
    } finally {
      setConnecting(false);
      setShowConnectModal(false);
    }
  };

  const handleManageClick = () => {
    // We use the same flow as connecting to ensure a 'state' token is generated.
    // This allows the backend to verify and sync the updated data when redirected back.
    handleConfirmConnect();
  };

  const handleViewAnalysis = (analysisId) => {
    if (!analysisId) return;
    navigate(`/student/project/pr-analysis/${analysisId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <span className="ml-3 text-sm text-gray-600">Checking connection…</span>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Failed to load connection status</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <Github className="h-10 w-10" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">AI Code Review</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Connect GitHub to unlock automated PR reviews</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
            Our AI reviewer scans every Pull Request, flags bugs and security issues, and leaves contextual comments directly on GitHub so your team can ship confidently.
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {['Automated AI reviews', 'Security & bug flags', 'Best practice tips', 'Instant team visibility'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                {benefit}
              </div>
            ))}
          </div>
          <button
            onClick={handleConnectClick}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
          >
            <Github className="h-4 w-4" /> Connect GitHub Repository
          </button>
          <p className="mt-3 text-xs text-gray-500">You will be redirected to GitHub to grant repository access. Permissions can be revoked at any time.</p>
        </div>

        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Connect your team repository</h3>
              <p className="mt-2 text-sm text-gray-600">You will install the CollabSphere AI Reviewer GitHub App and grant access to your team repository.</p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                <li>Install the CollabSphere GitHub App.</li>
                <li>Select the repositories you want AI to monitor.</li>
                <li>Get redirected back with the connection confirmed.</li>
              </ol>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmConnect}
                  disabled={connecting}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    'Continue to GitHub →'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Support multiple property names for full name (repositoryFullName, repository_full_name, or full_name from GitHub API)
  const repoNames = connectionInfo?.repositories?.map((repo) => 
    repo.repositoryFullName || 
    repo.repository_full_name || 
    repo.full_name || 
    repo.fullName || 
    repo.name
  ) || [];
  const repoSummary = repoNames.length > 1 ? `${repoNames[0]} + ${repoNames.length - 1} more` : repoNames[0];
  const lastAnalyzedAt = prAnalyses[0]?.analyzeAt || prAnalyses[0]?.analyzedAt;

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Code Review</h1>
            <p className="text-sm text-gray-500">Automated pull request analysis and feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPRAnalyses}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={handleManageClick}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Settings className="h-3.5 w-3.5" /> Manage
            </button>
          </div>
        </div>

        {/* Subtle Repository Status Bar */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 overflow-hidden sm:items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                    <Github className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-bold uppercase tracking-wider text-gray-400">Monitoring Repositories</span>
                    <div className="flex flex-wrap gap-2">
                        {repoNames.length > 0 ? (
                            repoNames.map((repo) => (
                                <span key={repo} className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-0.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    {repo}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">No repositories connected</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 sm:border-l sm:border-gray-200 sm:pl-4">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>Last sync: <span className="font-medium text-gray-700">{lastAnalyzedAt ? formatDate(lastAnalyzedAt, true) : 'Never'}</span></span>
            </div>
        </div>
      </header>

      {analysesError && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium">Failed to load analyses</p>
            <p className="text-xs text-amber-800">{analysesError}</p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <GitPullRequest className="h-5 w-5 text-blue-600" /> Recent Pull Request Analysis
            </h2>
            <p className="text-sm text-gray-500">At-a-glance insights across your latest AI-reviewed PRs.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[2fr_1.3fr_2fr_1.3fr_auto] gap-6 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid">
            <span>Pull Request</span>
            <span>Author</span>
            <span>AI Summary</span>
            <span>Issues</span>
            <span className="text-right">Score</span>
          </div>
          {loadingAnalyses ? (
            <div className="flex items-center justify-center px-6 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              <span className="ml-3 text-sm text-gray-600">Loading analyses…</span>
            </div>
          ) : prAnalyses.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-600">
              No Pull Requests have been analyzed yet. Create a PR to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {prAnalyses.map((analysis) => {
                const analysisId = analysis.analysisId || analysis.id;
                const score = Number(analysis.aiOverallScore ?? analysis.aiOverallSCore ?? 0);
                return (
                  <div
                    key={analysisId}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewAnalysis(analysisId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleViewAnalysis(analysisId);
                      }
                    }}
                    className="group grid gap-4 px-4 py-5 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:grid-cols-[2fr_1.3fr_2fr_1.3fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-gray-900">
                        {analysis.prTitle || 'Untitled Pull Request'}
                        {renderPRStateBadge(analysis.prState)}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                         <div className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
                            <Github className="h-3 w-3" />
                            {analysis.repositoryFullName || 'Unknown Repository'}
                         </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Opened by <span className="font-medium text-gray-900">{analysis.prAuthorGithubUsername || 'Unknown'}</span>
                      <span className="mx-1 text-gray-400">•</span>
                      {formatDate(analysis.prCreatedAt, true)}
                    </div>
                    <div className="text-sm text-gray-700">
                      {analysis.aiSummary || 'AI summary is not available yet for this review.'}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1 text-red-600">
                        <Bug className="h-4 w-4" /> {analysis.aiBugCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <ShieldAlert className="h-4 w-4" /> {analysis.aiSecurityIssueCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <Lightbulb className="h-4 w-4" /> {analysis.aiSuggestionCount ?? 0}
                      </span>
                      <a
                        href={analysis.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="ml-auto inline-flex items-center gap-1 text-gray-500 hover:text-gray-800"
                      >
                        GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreBadgeClasses(score)}`}>
                        {score.toFixed(1)} / 10
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-blue-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
        Want a refresher on the workflow?{' '}
        <a
          href="https://docs.collabsphere.com/ai-code-review"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Read the documentation →
        </a>
      </div>
    </div>
  );
};

const normalizeAnalysesResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map((item) => mapAnalysisItem(item));

  const repoDefaults = {
    name:
      response?.analysisDetail?.repositoryInfo?.fullName ||
      response?.repositoryInfo?.fullName,
    id: response?.analysisDetail?.repositoryInfo?.id || response?.repositoryInfo?.id
  };

  const pagedItems =
    response?.analysisDetail?.pagination?.items ||
    response?.pagination?.items ||
    response?.analysisDetail?.items;

  if (Array.isArray(pagedItems)) {
    return pagedItems.map((item) => mapAnalysisItem(item, repoDefaults));
  }

  const candidates = [
    response?.analysisDetail?.pagination,
    response?.analyses,
    response?.prAnalyses,
    response?.items,
    response?.list,
    response?.result,
    response?.data?.items,
    response?.data?.list,
    response?.data?.result,
    response?.data
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item) => mapAnalysisItem(item, repoDefaults));
    }
    if (candidate?.items && Array.isArray(candidate.items)) {
      return candidate.items.map((item) => mapAnalysisItem(item, repoDefaults));
    }
  }

  return [];
};

const mapAnalysisItem = (item = {}, repoDefaults = {}) => ({
  analysisId: item.analysisId ?? item.id,
  prNumber: item.prNumber ?? item.number,
  prTitle: item.prTitle ?? item.title ?? 'Untitled Pull Request',
  prAuthorGithubUsername: item.prAuthorGithubUsername ?? item.prAuthor ?? item.author ?? 'Unknown',
  prUrl: item.prUrl ?? item.url,
  prState: item.prState ?? item.state,
  prCreatedAt: item.analyzedAt ?? item.analyzedAt,
  repositoryFullName: item.repositoryFullName ?? item.repoFullName ?? repoDefaults.name,
  repositoryId: item.repositoryId ?? repoDefaults.id,
  aiOverallScore: item.aiOverallScore ?? item.aiScore ?? 0,
  aiBugCount: item.aiBugCount ?? item.bugCount ?? 0,
  aiSecurityIssueCount: item.aiSecurityIssueCount ?? item.securityIssueCount ?? 0,
  aiSuggestionCount: item.aiSuggestionCount ?? item.suggestionCount ?? 0,
  aiSummary: item.aiSummary ?? item.summary,
  analyzeAt: item.analyzeAt ?? item.analyzedAt,
  analyzedAt: item.analyzedAt ?? item.analyzeAt,
  prAuthor: item.prAuthor ?? item.author,
});

const getScoreBadgeClasses = (score) => {
  if (score >= 8) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
  if (score >= 5) {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  return 'bg-rose-50 text-rose-700 border border-rose-200';
};

const renderPRStateBadge = (state) => {
  if (!state) return null;
  const normalized = String(state).toLowerCase();
  const config = {
    merged: { label: 'Merged', classes: 'bg-purple-100 text-purple-700' },
    open: { label: 'Open', classes: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', classes: 'bg-gray-100 text-gray-700' }
  };
  const badge = config[normalized] || { label: state, classes: 'bg-gray-100 text-gray-700' };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.classes}`}>{badge.label}</span>;
};

const formatDate = (value, includeTime = false) => {
  if (!value) return 'Unknown date';
  try {
    const date = new Date(value);
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  } catch (error) {
    return value;
  }
};

export default AICodeReviewTab;
