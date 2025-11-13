import React from "react";
import {
  FileText,
  User,
  Target,
  Flag,
  ClipboardList,
  Info,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectApprovalList({ projects }) {
  const navigate = useNavigate();

  const handleSelectProject = (project) => {
    navigate(`/head-department/project-approvals/${project.projectId}`, {
      state: { project },
    });
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
            {projects.map((project) => (
              <div
                key={project.projectId}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col justify-between"
              >
                {/* Header */}
                <div>
                  {/* Subject */}
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <p className="text-indigo-600 font-semibold text-sm">
                      {project.subjectName}
                    </p>
                  </div>

                  {/* Project name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-700" />
                    {project.projectName}
                  </h2>

                  {/* Description */}
                  <div className="flex items-start gap-2 mb-3 text-gray-600">
                    <Info className="w-4 h-4 text-gray-400 mt-1" />
                    <p className="leading-relaxed text-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Lecturer */}
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-gray-700">
                      {project.lecturerName}
                    </span>
                  </div>

                  {/* Objectives & Milestones */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-400 font-semibold">
                          OBJECTIVES
                        </p>
                      </div>
                      <p className="text-lg font-semibold">
                        {project.objectiveCount || 0}
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <Flag className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-400 font-semibold">
                          MILESTONES
                        </p>
                      </div>
                      <p className="text-lg font-semibold">
                        {project.milestoneCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Recent Objective */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-4 h-4 text-gray-500" />
                      <p className="text-xs text-gray-400 font-semibold">
                        RECENT OBJECTIVE
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {project.recentObjective || "—"}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between gap-2 mt-6">
                  <button
                    onClick={() => handleSelectProject(project)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Open project detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
