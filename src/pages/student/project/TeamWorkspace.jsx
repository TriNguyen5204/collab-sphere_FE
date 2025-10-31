import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, GraduationCap, CheckCircle, Flag, CheckSquare } from 'lucide-react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import StatCard from '../../../components/student/StatCard';
import GitRepoCard from '../../../components/student/GitRepoCard';
import ProgressAnalytics from '../../../components/student/ProgressAnalytics';
import ActivityFeed from '../../../components/student/ActivityFeed';
import GitConfigModal from '../../../components/student/GitConfigModal';
import ProjectOverview from '../../../components/student/ProjectOverview';
import { Skeleton } from '../../../components/skeletons/StudentSkeletons';
import { getDetailOfProjectByProjectId, getDetailOfTeamByTeamId } from '../../../services/userService';
import { useTeam } from '../../../context/TeamContext.jsx';

const TeamWorkspace = () => {
  const { projectId, teamId } = useParams();
  const [selectedRole, setSelectedRole] = useState('all');
  const { setTeam, team } = useTeam();

  // Call api to get team details
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState(null);

  const fetchTeamDetails = async (teamId) => {
    if (!teamId) return;
    try {
      setTeamLoading(true);
      setTeamError(null);
      const response = await getDetailOfTeamByTeamId(teamId);
      setTeam(response);
      console.log('Team Details:', response);
    } catch (e) {
      console.error('Error fetching team details:', e);
      setTeamError(e?.message || 'Failed to load team');
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails(teamId);
    }
  }, [teamId]);

  // Call api to get project details
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState(null);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      setProjectLoading(true);
      setProjectError(null);
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

  // Sample data
  const [teamData] = useState({
    leader: {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?u=1",
      role: "Leader",
      projectRoles: ["Frontend", "UI/UX"],
      tasksCompleted: 15,
      tasksInProgress: 3,
      contribution: 35,
    },
    members: [
      {
        id: 2,
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "https://i.pravatar.cc/150?u=2",
        role: "Member",
        projectRoles: ["Backend"],
        tasksCompleted: 12,
        tasksInProgress: 2,
        contribution: 28,
        status: "online",
      },
      {
        id: 3,
        name: "Charlie Brown",
        email: "charlie@example.com",
        avatar: "https://i.pravatar.cc/150?u=3",
        role: "Member",
        projectRoles: ["Frontend"],
        tasksCompleted: 10,
        tasksInProgress: 4,
        contribution: 22,
        status: "away",
      },
      {
        id: 4,
        name: "Diana Prince",
        email: "diana@example.com",
        avatar: "https://i.pravatar.cc/150?u=4",
        role: "Member",
        projectRoles: ["UI/UX"],
        tasksCompleted: 8,
        tasksInProgress: 1,
        contribution: 15,
        status: "offline",
      },
    ],
    gitRepo: {
      url: "https://github.com/team-alpha/collab-sphere",
      branch: "main",
      lastCommit: "2025-10-05T14:30:00",
      commits: 147,
      contributors: 4,
    },
    progress: {
      overall: 65,
      tasksTotal: 50,
      tasksCompleted: 32,
      tasksInProgress: 10,
      tasksBlocked: 2,
      tasksTodo: 6,
    },
    activity: [
      { id: 1, user: "Alice", action: "completed task", task: "Design homepage", time: "2 hours ago" },
      { id: 2, user: "Bob", action: "committed code", task: "Auth API implementation", time: "3 hours ago" },
      { id: 3, user: "Charlie", action: "started task", task: "Navigation component", time: "5 hours ago" },
      { id: 4, user: "Diana", action: "commented on", task: "Design homepage", time: "6 hours ago" },
    ],
  });

  // const [aiMessages, setAiMessages] = useState([
  //   {
  //     id: 1,
  //     type: 'ai',
  //     content: 'Hello! I\'m your AI assistant. I can help analyze your team\'s Git activity, suggest improvements, and provide advice on project management.',
  //     timestamp: new Date().toISOString(),
  //   },
  //   {
  //     id: 2,
  //     type: 'ai',
  //     content: 'Based on your recent commits, I notice that the authentication module has been updated. Would you like me to review the code quality or suggest security best practices?',
  //     timestamp: new Date().toISOString(),
  //   }
  // ]);
  const [aiInput, setAiInput] = useState('');
  const [showGitConfig, setShowGitConfig] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  // const handleSendMessage = () => {
  //   if (aiInput.trim()) {
  //     const newMessage = {
  //       id: aiMessages.length + 1,
  //       type: 'user',
  //       content: aiInput,
  //       timestamp: new Date().toISOString(),
  //     };
  //     setAiMessages([...aiMessages, newMessage]);
  //     setAiInput('');

  //     // Simulate AI response
  //     setTimeout(() => {
  //       const aiResponse = {
  //         id: aiMessages.length + 2,
  //         type: 'ai',
  //         content: 'I\'m analyzing your request. This is a simulated response. In production, this would connect to an AI service to provide intelligent insights about your project.',
  //         timestamp: new Date().toISOString(),
  //       };
  //       setAiMessages(prev => [...prev, aiResponse]);
  //     }, 1000);
  //   }
  // };

  const handleSaveGitConfig = (config) => {
    console.log('Saving Git configuration:', config);
  };

  const convertTeamRole = (teamRole) => {
    switch (teamRole) {
      case 1:
        return 'Leader';
      case 0:
        return 'Member';
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
        <ProjectBoardHeader selectedRole={selectedRole} onRoleChange={setSelectedRole} />

        <main className="p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Analytics, Milestones, Activity */}
            <div className="space-y-4">
              {/* 1) Progress Analytics */}
              <ProgressAnalytics progress={team?.teamProgress} loading={teamLoading} />

              {/* 2) Milestone Summary */}
              <div className="bg-white rounded-lg shadow-md p-3">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Flag size={16} className="text-blue-500" />
                  Milestone Summary
                </h2>
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
              </div>

              {/* 3) Recent Activity */}
              <ActivityFeed activities={teamData.activity} loading={teamLoading} />
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
                          <img
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

              {/* 4) Git Repository */}
              <div className="bg-white rounded-lg shadow-md p-3">
                {teamLoading || projectLoading ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-14 w-full" />
                      <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ) : (
                  <GitRepoCard
                    gitRepo={teamData.gitRepo}
                    onConfigClick={() => setShowGitConfig(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Git Config Modal */}
        <GitConfigModal
          isOpen={showGitConfig}
          onClose={() => setShowGitConfig(false)}
          currentConfig={teamData.gitRepo}
          onSave={handleSaveGitConfig}
        />
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