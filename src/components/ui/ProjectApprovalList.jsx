import React from "react";
import { FileText, User, Clock, CheckCircle, XCircle, ChevronRight} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function ProjectApprovalList({ projects }) {
  const navigate = useNavigate();

  const handleSelectProject = (project) => {
    navigate(`/head-department/project-approvals/${project.projectId}`, { state: { project } });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Folder className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-500 text-lg">
              There are currently no project submissions to review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => {
              const statusConfig = project.status;
              // const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={project.projectId}
                  onClick={() => handleSelectProject(project)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-indigo-200 transform hover:scale-[1.01] group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Project Icon */}
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            <FileText className="w-8 h-8 text-indigo-600" />
                          </div>
                          
                          {/* Project Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {project.projectName}
                              </h3>
                            </div>
                            
                            {/* Subject Badge */}
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full mb-3 border border-indigo-100">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                              <span className="font-bold text-indigo-700 text-sm">
                                {project.subjectName}
                              </span>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed mb-4 text-base">
                              {project.description}
                            </p>
                            
                            {/* Lecturer Info */}
                            <div className="items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg inline-flex">
                              <div className="bg-indigo-100 p-2 rounded-lg">
                                <User className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Lecturer</p>
                                <p className="font-bold text-gray-900">
                                  {project.lecturerName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Status & Action */}
                      <div className="flex flex-col items-end gap-4 flex-shrink-0">
                        
                        {/* Action Button */}
                        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform group-hover:scale-105">
                          View Details
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Accent Line */}
                  <div className={`h-1.5 bg-gradient-to-r ${statusConfig.dotColor === 'bg-amber-500' ? 'from-amber-400 to-amber-600' : statusConfig.dotColor === 'bg-green-500' ? 'from-green-400 to-green-600' : statusConfig.dotColor === 'bg-red-500' ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'}`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}