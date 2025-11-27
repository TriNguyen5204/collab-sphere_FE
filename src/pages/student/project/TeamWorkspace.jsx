import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Users, GraduationCap, CheckCircle, Flag, CheckSquare, LayoutDashboard, Bot, X } from 'lucide-react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import StatCard from '../../../components/student/StatCard';
import ProgressAnalytics from '../../../components/student/ProgressAnalytics';
import ProjectOverview from '../../../components/student/ProjectOverview';
import { Skeleton } from '../../../components/skeletons/StudentSkeletons';
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
        <nav className="bg-white border-b border-gray-200 px-4">
          <ul className="flex space-x-8">
            <li>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('ai-review')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                  activeTab === 'ai-review' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bot className="w-4 h-4" />
                AI Code Review
              </button>
            </li>
          </ul>
        </nav>

        <main className="p-4">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Analytics, Milestones, Activity */}
            <div className="space-y-4">
              {/* 1) Progress Analytics */}
              <ProgressAnalytics progress={team?.teamProgress} loading={teamLoading} />

              {/* 2) Milestone Summary */}
              {/* <div className="">
                {teamLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  (() => {
                    const tp = team?.teamProgress || {};
                    const milestonesComplete = tp.milestonesComplete ?? 0;
                    const totalMilestones = tp.totalMilestones ?? 0;
                    const checkpointsComplete = tp.checkpointsComplete ?? 0;
                    const totalCheckpoints = tp.totalCheckpoints ?? 0;
                    const tasksCompleted = tp.tasksCompleted ?? 0;
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <StatCard
                          icon={Flag}
                          value={`${milestonesComplete}/${totalMilestones}`}
                          label="Milestones Completed"
                          iconColor="text-blue-500"
                          size="sm"
                        />
                        <StatCard
                          icon={CheckSquare}
                          value={`${checkpointsComplete}/${totalCheckpoints}`}
                          label="Checkpoints Completed"
                          iconColor="text-green-600"
                          size="sm"
                        />
                        <StatCard
                          icon={CheckCircle}
                          value={typeof tasksCompleted === 'number' ? String(tasksCompleted) : '—'}
                          label="Tasks Completed"
                          iconColor="text-yellow-600"
                          size="sm"
                        />
                      </div>
                    );
                  })()
                )}
              </div> */}
            </div>

            {/* Right Column - Overview, Team, Lecturer, Git */}
            <div className="space-y-4">
              {/* 1) Project Overview */}
              <ProjectOverview
                project={projectDetails}
                loading={projectLoading}
                error={projectError}
                className=""
                compact
              />
              {/* 2) Team Members */}
              <div className="bg-white rounded-lg shadow-md p-3">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users size={16} />
                  Team Members ({team?.memberInfo?.memberCount ?? 0})
                </h2>
                {teamLoading ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 border rounded-lg">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-40 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-4 w-12 mb-1" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {(team?.memberInfo?.members ?? []).map((member) => (
                      <div key={member.studentId} className="flex items-center gap-3 p-2.5 border rounded-lg hover:bg-gray-50 transition">
                        <div className="relative">
                          <MemberAvatar
                            name={member.studentName}
                            src={member.avatar}
                            alt={member.studentName}
                            className="w-8 h-8 rounded-full bg-white object-cover border"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs truncate">{member.studentName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{convertTeamRole(member.teamRole)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3) Lecturer Info
              <div className="bg-white rounded-lg shadow-md p-3">
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Lecturer Info
                </h2>
                {projectLoading ? (
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center justify-between py-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium">{projectDetails?.lecturerName || '-'}</span>
                    </div>
                  </div>
                )}
              </div> */}
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
      {/* Floating AI Chat
    <button
      onClick={() => setChatOpen(true)}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
    >
      <Sparkles size={18} />
      <span className="text-sm font-medium">AI Assistant</span>
    </button>

  {chatOpen && (
      <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h3 className="text-sm font-semibold">AI Assistant</h3>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 max-h-[50vh] overflow-y-auto p-3 space-y-3">
          {aiMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2.5 ${
                  message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-[10px] mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI for help or advice..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            💡 Try: "Review my recent commits"
          </p>
        </div>
      </div>
    )} */}
    </>
  );
};

export default TeamWorkspace;