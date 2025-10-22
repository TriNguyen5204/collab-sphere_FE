import React from "react";
import { FileText, User} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function ProjectApprovalList({ projects }) {
  const navigate = useNavigate();

  const handleSelectProject = (project) => {
    navigate(`/head-department/project-approvals/${project.projectId}`, { state: { project } });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Project Approval Requests
          </h2>
          <p className="text-gray-500 mt-1">
            Review and manage project submissions
          </p>
        </div>

      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            There are no projects
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.projectId}
              onClick={() => handleSelectProject(project)}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {project.projectName}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-indigo-600">
                      {project.subjectName}
                    </span>{" "}
                    • {project.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    Lecturer:{" "}
                    <span className="font-medium text-gray-700">
                      {project.lecturerName}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Status: {project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}