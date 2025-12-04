import React from "react";
import {
  FileText,
  User,
  Target,
  Flag,
  ClipboardList,
  Info,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectApprovalList({ projects }) {
  const navigate = useNavigate();
  console.log("Projects in ProjectApprovalList:", projects);

  const handleSelectProject = (project) => {
    navigate(`/head-department/project-approvals/${project.projectId}`, {
      state: { project },
    });
  };

  // Function to get status badge style
  const getStatusBadge = (statusString) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
        label: "Pending",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        label: "Approved",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        label: "Rejected",
      },
    };

    return (
      statusConfig[statusString] || {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        label: statusString || "Unknown",
      }
    );
  };

  // Function to count milestones from objectives
  const countMilestones = (objectives) => {
    if (!objectives || !Array.isArray(objectives)) return 0;
    return objectives.reduce((total, obj) => {
      return total + (obj.objectiveMilestones?.length || 0);
    }, 0);
  };

  // Function to get recent objective
  const getRecentObjective = (objectives) => {
    if (!objectives || objectives.length === 0) return "—";
    // Get first objective's description
    return objectives[0]?.description || "—";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-500 text-lg">
              There are currently no project submissions to review
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const statusBadge = getStatusBadge(project.statusString);
              const milestoneCount = countMilestones(project.objectives);
              const recentObjective = getRecentObjective(project.objectives);

              return (
                <div
                  key={project.projectId}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div>
                    {/* Status Badge & Subject */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <p className="text-indigo-600 font-semibold text-sm">
                          {project.subjectName || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Project name */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-700" />
                      {project.projectName || "Untitled Project"}
                    </h2>

                    {/* Description */}
                    {project.description && (
                      <div className="flex items-start gap-2 mb-4 text-gray-600">
                        <Info className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="leading-relaxed text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Lecturer */}
                    <div className="flex items-center gap-2 text-sm mb-4 bg-gray-50 p-2 rounded-lg">
                      <User className="w-4 h-4 text-indigo-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {project.lecturerName || "Unknown"}
                        </span>
                        {project.lecturerCode && (
                          <span className="text-xs text-gray-500">
                            {project.lecturerCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Objectives & Milestones */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-3">
                      <div className="flex flex-col bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-600 font-semibold uppercase">
                            Objectives
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {project.objectives?.length || 0}
                        </p>
                      </div>

                      <div className="flex flex-col bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Flag className="w-4 h-4 text-purple-600" />
                          <p className="text-xs text-purple-600 font-semibold uppercase">
                            Milestones
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {milestoneCount}
                        </p>
                      </div>
                    </div>

                    {/* Recent Objective */}
                    <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <ClipboardList className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-amber-600 font-semibold uppercase">
                          Recent Objective
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {recentObjective}
                      </p>
                    </div>

                    {/* Subject Code (if available) */}
                    {project.subjectCode && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>Subject Code: {project.subjectCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleSelectProject(project)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}