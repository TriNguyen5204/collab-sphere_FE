import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Users, GraduationCap, CheckCircle, Flag, CheckSquare, LayoutDashboard, Bot, X } from 'lucide-react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import StatCard from '../../../features/student/components/StatCard';
import ProgressAnalytics from '../../../features/student/components/ProgressAnalytics';
import ProjectOverview from '../../../features/student/components/ProjectOverview';
import { Skeleton } from '../../../features/student/components/skeletons/StudentSkeletons';
import { getDetailOfProjectByProjectId, getDetailOfTeamByTeamId } from '../../../services/studentApi';
import { handleCallback } from '../../../services/githubApi';
import useTeam from '../../../context/useTeam';
import AICodeReviewTab from './AICodeReviewTab';
import { toast } from 'sonner';
import { useAvatar } from '../../../hooks/useAvatar';

const TeamWorkspace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { team } = useTeam();
  const projectId = team?.projectInfo?.projectId ?? null;
  const teamId = team?.teamId ?? null;
  const projectName = team?.projectInfo?.projectName ?? null;
  // Handle query parameters for tab switching and success toast
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const installationId = searchParams.get('installation_id');
      const state = searchParams.get('state');
      const setupAction = searchParams.get('setup_action');

      if (installationId) {
        // If it's an update action, we might not need to call the callback API if no state is present,
        // or we might just want to show a success message.
        if (setupAction === 'update' && !state) {
          setActiveTab('ai-review'); // Switch tab immediately for updates
          toast.success('GitHub settings updated successfully');
          setSearchParams({}); // Clear params
          return;
        }

        if (!state) {
          toast.error('Missing security token (state). Please try connecting again.');
          setSearchParams({});
          return;
        }

        try {
          const response = await handleCallback(installationId, state);
          if (response && response.success) {
            setActiveTab('ai-review'); // Switch tab after successful connection
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 5000);
            toast.success('Successfully connected to GitHub!');
          } else {
            toast.error(response?.message || 'Failed to connect to GitHub');
          }
        } catch (error) {
          console.error('GitHub callback error:', error);
          if (error.response && error.response.data) {
            console.error('Server Error Details:', error.response.data);

            let errorMsg = 'Failed to connect to GitHub';

            // Handle specific errorList format from backend (e.g. { errorList: [{ message: "..." }] })
            if (error.response.data.errorList && Array.isArray(error.response.data.errorList)) {
              errorMsg = error.response.data.errorList.map(e => e.message).join('\n');
            }
            // Handle Array of errors (legacy/other format)
            else if (Array.isArray(error.response.data)) {
              errorMsg = error.response.data.map(e => e.message).join('\n');
            }
            // Handle Standard ASP.NET Validation Problem Details
            else if (typeof error.response.data === 'object') {
              errorMsg = error.response.data.title || errorMsg;
              if (error.response.data.errors) {
                const details = Object.values(error.response.data.errors).flat().join(', ');
                if (details) errorMsg += `: ${details}`;
              }
            } else if (typeof error.response.data === 'string') {
              errorMsg = error.response.data;
            }

            toast.error(errorMsg);
          } else {
            toast.error(error.message || 'Failed to connect to GitHub');
          }
        } finally {
          // Clear query params to clean up URL
          setSearchParams({});
        }
      }
    };

    handleGitHubCallback();

    const tab = searchParams.get('tab');
    const active = searchParams.get('active');
    if (tab === 'ai-review' || active === 'ai-review') {
      setActiveTab('ai-review');
    }

    const firstConnect = searchParams.get('firstConnect');
    if (firstConnect === 'true') {
      setShowSuccessToast(true);
      // Clear query params after handling
      setSearchParams({});
      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  }, [searchParams, setSearchParams]);

  // // Call api to get team details
  const [teamLoading, setTeamLoading] = useState(false);

  // const fetchTeamDetails = async (teamId) => {
  //   if (!teamId) return;
  //   try {
  //     setTeamLoading(true);
  //     const response = await getDetailOfTeamByTeamId(teamId);
  //     setTeam(response);
  //     console.log('Team Details:', response);
  //   } catch (e) {
  //     console.error('Error fetching team details:', e);
  //   } finally {
  //     setTeamLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (teamId) {
  //     fetchTeamDetails(teamId);
  //   }
  // }, [teamId]);

  // Call api to get project details
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState(null);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      setProjectLoading(true);
      setProjectError(null);
      console.log(team);
      const response = await getDetailOfProjectByProjectId(projectId);
      setProjectDetails(response);
      console.log('Project Details:', response);
    } catch (e) {
      console.error('Error fetching project details:', e);
      setProjectError(e?.message || 'Failed to load project');
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const convertTeamRole = (teamRole) => {
    switch (teamRole) {
      case 1:
        return 'Leader';
      case 0:
        return 'Member';
    }
  };

  const MemberAvatar = ({ name, src, alt, className }) => {
    const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(name, src);
    if (shouldShowImage) {
      return (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={className}
        />
      );
    }

    return (
      <div className={`${className} flex items-center justify-center ${colorClass}`} aria-hidden>
        <span className="select-none text-sm font-semibold">{initials}</span>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
        <ProjectBoardHeader />
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in-right">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">
              GitHub connected! AI will now review your Pull Requests.
            </span>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 hover:bg-green-600 rounded p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="bg-white border-b border-gray-200 px-8">
          <div className=" mx-auto">
            <ul className="flex space-x-8">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-5 px-2 border-b-2 font-semibold text-base flex items-center gap-3 transition ${activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('ai-review')}
                  className={`py-5 px-2 border-b-2 font-semibold text-base flex items-center gap-3 transition ${activeTab === 'ai-review'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Bot className="w-5 h-5" />
                  AI Code Review
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="px-8 py-6 mx-auto">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Analytics, Milestones, Activity */}
                <div className="space-y-6">
                  {/* 1) Progress Analytics */}
                  <ProgressAnalytics progress={team?.teamProgress} loading={teamLoading} />
                  {/* 2) Team Members */}
                  <div className="bg-white rounded-lg shadow-md p-5">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
                      <Users size={20} />
                      Team Members ({team?.memberInfo?.memberCount ?? 0})
                    </h2>
                    {teamLoading ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <Skeleton className="h-5 w-48 mb-2" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-4 w-12 mb-1" />
                              <Skeleton className="h-3 w-10" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {(team?.memberInfo?.members ?? []).map((member) => (
                          <div key={member.studentId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                            <div className="relative">
                              <MemberAvatar
                                name={member.studentName}
                                src={member.avatar}
                                alt={member.studentName}
                                className="w-12 h-12 rounded-full bg-white object-cover border-2"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{member.studentName}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-sm px-3 py-1 rounded-full border font-medium ${member.teamRole === 1 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>{convertTeamRole(member.teamRole)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Overview, Team, Lecturer, Git */}
                <div className="space-y-4">
                  {/* 1) Project Overview */}
                  <ProjectOverview
                    project={projectDetails}
                    loading={projectLoading}
                    error={projectError}
                    className=""
                    compact={false}
                  />

                </div>
              </div>
            </div>
          )}

          {/* AI Code Review Tab Content */}
          {activeTab === 'ai-review' && (
            <AICodeReviewTab
              projectId={projectId}
              teamId={teamId}
              projectName={projectName}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default TeamWorkspace;
