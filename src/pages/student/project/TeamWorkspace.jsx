import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, TrendingUp, Crown, CheckCircle, Clock, Sparkles, Send, Filter } from 'lucide-react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TeamMemberCard from '../../../components/student/TeamMemberCard';
import StatCard from '../../../components/student/StatCard';
import GitRepoCard from '../../../components/student/GitRepoCard';
import ProgressAnalytics from '../../../components/student/ProgressAnalytics';
import ActivityFeed from '../../../components/student/ActivityFeed';
import GitConfigModal from '../../../components/student/GitConfigModal';

const TeamWorkspace = () => {
  const { id, projectName } = useParams();
  
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

  const [selectedRole, setSelectedRole] = useState('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help analyze your team\'s Git activity, suggest improvements, and provide advice on project management.',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'ai',
      content: 'Based on your recent commits, I notice that the authentication module has been updated. Would you like me to review the code quality or suggest security best practices?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [showGitConfig, setShowGitConfig] = useState(false);

  const roles = ['all', 'Frontend', 'Backend', 'UI/UX', 'QA', 'DevOps'];

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const handleSendMessage = () => {
    if (aiInput.trim()) {
      const newMessage = {
        id: aiMessages.length + 1,
        type: 'user',
        content: aiInput,
        timestamp: new Date().toISOString(),
      };
      setAiMessages([...aiMessages, newMessage]);
      setAiInput('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: aiMessages.length + 2,
          type: 'ai',
          content: 'I\'m analyzing your request. This is a simulated response. In production, this would connect to an AI service to provide intelligent insights about your project.',
          timestamp: new Date().toISOString(),
        };
        setAiMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleSaveGitConfig = (config) => {
    console.log('Saving Git configuration:', config);
    // In production, this would make an API call to save the configuration
  };

  // Filter members by role
  const filteredMembers = selectedRole === 'all' 
    ? teamData.members 
    : teamData.members.filter(member => member.projectRoles.includes(selectedRole));

  const showLeader = selectedRole === 'all' || teamData.leader.projectRoles.includes(selectedRole);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      
      <main className="p-6 space-y-6">
        {/* Page Header with Filter Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Workspace</h1>
            <p className="text-gray-600 mt-1">Manage your team and track collaboration</p>
          </div>
          
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition border border-gray-200"
            >
              <Filter size={20} />
              <span className="font-medium">
                {selectedRole === 'all' ? 'All Roles' : selectedRole}
              </span>
            </button>

            {/* Popup Menu */}
            {showRoleFilter && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleFilter(false)}
                />
                
                {/* Popup */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Filter size={18} />
                      Filter by Role
                    </h3>
                  </div>
                  
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setShowRoleFilter(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center justify-between ${
                          selectedRole === role
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                        {selectedRole === role && (
                          <CheckCircle size={18} className="text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {selectedRole !== 'all' && (
                    <div className="p-2 border-t">
                      <button
                        onClick={() => {
                          setSelectedRole('all');
                          setShowRoleFilter(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            value={teamData.members.length + 1}
            label="Team Members"
            iconColor="text-blue-500"
          />
          <StatCard
            icon={CheckCircle}
            value={teamData.progress.tasksCompleted}
            label="Tasks Completed"
            iconColor="text-green-500"
          />
          <StatCard
            icon={Clock}
            value={teamData.progress.tasksInProgress}
            label="In Progress"
            iconColor="text-yellow-500"
          />
          <StatCard
            icon={TrendingUp}
            value={`${teamData.progress.overall}%`}
            label="Overall Progress"
            iconColor="text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Team Members (Compact) */}
          <div className="space-y-6">
            {/* Team Leader - Compact */}
            {showLeader && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown className="text-yellow-500" size={20} />
                  Team Leader
                </h2>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <img
                    src={teamData.leader.avatar}
                    alt={teamData.leader.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{teamData.leader.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{teamData.leader.email}</p>
                    <div className="flex gap-1 mt-1">
                      {teamData.leader.projectRoles.map((role, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{teamData.leader.contribution}%</div>
                    <p className="text-xs text-gray-600">{teamData.leader.tasksCompleted} done</p>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members - Compact */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users size={20} />
                Team Members ({filteredMembers.length})
              </h2>
              
              {filteredMembers.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {member.projectRoles.map((role, idx) => (
                            <span key={idx} className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{member.contribution}%</div>
                        <p className="text-xs text-gray-600">{member.tasksCompleted} done</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No members with selected role
                </div>
              )}
            </div>

            {/* Git Repository - Compact */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <GitRepoCard 
                gitRepo={teamData.gitRepo} 
                onConfigClick={() => setShowGitConfig(true)}
              />
            </div>
          </div>

          {/* Middle Column - AI Assistant */}
          <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
            <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-lg">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles size={24} />
                AI Assistant
              </h2>
              <p className="text-sm text-white/90 mt-1">Get insights and advice on your project</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI for help or advice..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Try asking: "Review my recent commits" or "Suggest improvements for team collaboration"
              </p>
            </div>
          </div>

          {/* Right Column - Analytics & Activity */}
          <div className="space-y-6">
            <ProgressAnalytics progress={teamData.progress} />
            <ActivityFeed activities={teamData.activity} />
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
  );
};

export default TeamWorkspace;