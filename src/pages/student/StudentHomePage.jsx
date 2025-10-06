import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import StudentSidebar from "../../components/layout/StudentSidebar";
import { History, Star, Calendar, TrendingUp, Users, CheckCircle2, Clock, AlertCircle, Target } from "lucide-react";

const sampleProjects = [
  { ProjectId: 1, ProjectName: "CollabSphere", Description: "A collaborative platform for students.", Status: "Processing", Progress: 65, Team: "Team Alpha", Deadline: "2025-10-15" },
  { ProjectId: 2, ProjectName: "Glamping", Description: "A luxurious camping experience.", Status: "Completed", Progress: 100, Team: "Team Beta", Deadline: "2025-09-30" },
  { ProjectId: 3, ProjectName: "Diamond", Description: "A precious gemstone project.", Status: "Completed", Progress: 100, Team: "Team Gamma", Deadline: "2025-09-25" },
  { ProjectId: 4, ProjectName: "EcoTracker", Description: "Environmental monitoring system.", Status: "Processing", Progress: 40, Team: "Team Delta", Deadline: "2025-10-20" },
];

const upcomingDeadlines = [
  { id: 1, projectId: 1, projectName: "CollabSphere", taskName: "Complete Authentication Module", dueDate: "2025-10-08", priority: "high", status: "in-progress" },
  { id: 2, projectId: 1, projectName: "CollabSphere", taskName: "Design Database Schema", dueDate: "2025-10-10", priority: "medium", status: "todo" },
  { id: 3, projectId: 4, projectName: "EcoTracker", taskName: "API Integration", dueDate: "2025-10-12", priority: "high", status: "in-progress" },
  { id: 4, projectId: 4, projectName: "EcoTracker", taskName: "Unit Testing", dueDate: "2025-10-15", priority: "low", status: "todo" },
];

const teamMembers = [
  { id: 1, name: "Alice Johnson", avatar: "https://i.pravatar.cc/40?u=1", role: "Team Lead", status: "online" },
  { id: 2, name: "Bob Smith", avatar: "https://i.pravatar.cc/40?u=2", role: "Developer", status: "online" },
  { id: 3, name: "Charlie Brown", avatar: "https://i.pravatar.cc/40?u=3", role: "Designer", status: "away" },
  { id: 4, name: "Diana Prince", avatar: "https://i.pravatar.cc/40?u=4", role: "QA Tester", status: "offline" },
];

const statusColors = (status) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const priorityColors = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getDaysUntilDeadline = (deadline) => {
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const StudentHomePage = () => {
  const [starred, setStarred] = useState([]);
  const navigate = useNavigate();

  const handleCardClick = (project) => {
    navigate(`/student/project/${project.ProjectId}/${encodeURIComponent(project.ProjectName)}`);
  };

  const toggleStar = (e, projectId) => {
    e.stopPropagation();
    setStarred((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Calculate overall progress
  const overallProgress = Math.round(
    sampleProjects.reduce((acc, p) => acc + p.Progress, 0) / sampleProjects.length
  );

  const renderProjectCard = (project) => {
    const isStarred = starred.includes(project.ProjectId);

    return (
      <div
        key={project.ProjectId}
        className="bg-white rounded-lg shadow-md w-80 relative group hover:ring-2 hover:ring-brand-500 hover:shadow-lg transition cursor-pointer"
        onClick={() => handleCardClick(project)}
      >
        <button
          onClick={(e) => toggleStar(e, project.ProjectId)}
          className="absolute top-2 right-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition z-10"
        >
          <div className="relative group/star">
            <Star
              className={`h-6 w-6 transform transition-transform duration-200 ${
                isStarred
                  ? "text-yellow-500 scale-100"
                  : "text-gray-400 group-hover/star:scale-110 hover:text-gray-600"
              }`}
              fill={isStarred ? "currentColor" : "none"}
            />
            <span className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/star:opacity-100 transition duration-300 delay-500 pointer-events-none whitespace-nowrap">
              {isStarred
                ? `Click to unstar ${project.ProjectName}. It will be removed from your starred list.`
                : `Click to star ${project.ProjectName}. It will be added to your starred list.`}
            </span>
          </div>
        </button>

        <div className={`flex justify-end rounded-t-lg w-full h-24 ${statusColors(project.Status)}`} />
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{project.ProjectName}</h2>
          <p className="text-sm text-gray-600 mb-3">{project.Description}</p>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{project.Progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  project.Progress === 100 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${project.Progress}%` }}
              />
            </div>
          </div>

          {/* Team and Deadline */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{project.Team}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(project.Deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
        <StudentSidebar />

        <main className="flex-1 p-6 space-y-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Projects Card */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold text-brand-600">
                    {sampleProjects.filter(p => p.Status === "Processing").length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines Card */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {upcomingDeadlines.filter(d => getDaysUntilDeadline(d.dueDate) <= 7).length}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed Projects</p>
                  <p className="text-3xl font-bold text-green-600">
                    {sampleProjects.filter(p => p.Status === "Completed").length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Overall Progress Card */}
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Overall Progress</p>
                  <p className="text-3xl font-bold text-purple-600">{overallProgress}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Target className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Members and Upcoming Deadlines - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Members Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-brand-600" />
                  Active Team Members
                </h2>
                <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-200"
                  >
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === "online"
                            ? "bg-green-500"
                            : member.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="text-orange-600" />
                  Upcoming Deadlines
                </h2>
                <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 4).map((task) => {
                  const daysUntil = getDaysUntilDeadline(task.dueDate);
                  const isUrgent = daysUntil <= 2;
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        isUrgent ? "bg-red-50 border-red-500" : "bg-gray-50 border-gray-300"
                      } hover:shadow-md transition cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {task.taskName}
                          </h3>
                          <p className="text-xs text-gray-600">{task.projectName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${priorityColors(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className={`text-xs font-medium ${isUrgent ? "text-red-600" : "text-gray-700"}`}>
                          {daysUntil === 0 ? "Due Today" : daysUntil === 1 ? "Due Tomorrow" : `Due in ${daysUntil} days`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Starred Projects Section */}
          {starred.length > 0 && (
            <div>
              <h1 className="flex items-center text-2xl font-bold mb-4">
                <Star className="inline-block mr-3 h-7 w-7 text-yellow-500" fill="currentColor" />
                Starred Projects
              </h1>
              <div className="flex flex-wrap gap-6">
                {sampleProjects
                  .filter((p) => starred.includes(p.ProjectId))
                  .map(renderProjectCard)}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <div>
            <h1 className="flex items-center text-2xl font-bold mb-4">
              <History className="inline-block mr-3 h-7 w-7" />
              Recently Viewed
            </h1>
            <div className="flex flex-wrap gap-6">
              {sampleProjects.map(renderProjectCard)}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentHomePage;
