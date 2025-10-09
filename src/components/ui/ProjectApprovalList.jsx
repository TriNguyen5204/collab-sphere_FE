import React, { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText, Target, Calendar, User, MessageSquare, ChevronDown, ChevronUp, AlertCircle, Flag } from 'lucide-react';

export default function ProjectApprovalList({ projects, onApprove, onReject }) {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  // const [feedbackText, setFeedbackText] = useState("");
  const [activeFilter, setActiveFilter] = useState("pending");

  const handleApprove = (projectId) => {
    onApprove(projectId);
    // setFeedbackText("");
    setExpandedProjectId(null);
  };

  const handleReject = (projectId) => {
    onReject(projectId);
    // setFeedbackText("");
    setExpandedProjectId(null);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Approved";
      case 2: return "Rejected";
      default: return "Unknown";
    }
  };

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "pending") return project.status === 0;
    if (activeFilter === "approved") return project.status === 1;
    if (activeFilter === "rejected") return project.status === 2;
    return true;
  });

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

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm inline-flex p-1">
          {["pending", "approved", "rejected", "all"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                activeFilter === filter
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter === "pending" && <Clock className="w-4 h-4" />}
              {filter === "approved" && <CheckCircle className="w-4 h-4" />}
              {filter === "rejected" && <XCircle className="w-4 h-4" />}
              {filter === "all" && <FileText className="w-4 h-4" />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            No {activeFilter !== "all" ? activeFilter : ""} projects found
          </h3>
          <p className="text-gray-500">
            There are no projects matching your current filter
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.projectId}
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
                    <span>Status: {getStatusLabel(project.status)}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedProjectId(
                      expandedProjectId === project.projectId
                        ? null
                        : project.projectId
                    )
                  }
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                >
                  {expandedProjectId === project.projectId ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Details
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedProjectId === project.projectId && (
                <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-6">
                  {/* Objectives */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Project Objectives
                    </h4>
                    {project.objectives.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">
                        No objectives defined.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {project.objectives.map((obj) => (
                          <li
                            key={obj.objectiveId}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-gray-800">
                                {obj.description}
                              </p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  obj.priority === "High"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {obj.priority}
                              </span>
                            </div>

                            {/* Milestones */}
                            {obj.objectiveMilestones.length > 0 && (
                              <ul className="mt-3 space-y-2">
                                {obj.objectiveMilestones.map((ms) => (
                                  <li
                                    key={ms.objectiveMilestoneId}
                                    className="border-l-4 border-indigo-400 pl-3 text-sm text-gray-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Flag className="w-4 h-4 text-indigo-500" />
                                      <span className="font-medium">
                                        {ms.title}
                                      </span>
                                    </div>
                                    <p className="ml-6 text-gray-600">
                                      {ms.description}
                                    </p>
                                    <p className="ml-6 text-xs text-gray-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {ms.startDate} → {ms.endDate}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Feedback section */}
                  {project.status === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Action Required
                        </h4>
                      </div>

                      {/* <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Add feedback or comments..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      /> */}

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleReject(project.projectId)}
                          className="px-5 py-2.5 border border-red-300 rounded-lg text-sm font-semibold text-red-700 bg-white hover:bg-red-50 transition"
                        >
                          <XCircle className="inline w-4 h-4 mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(project.projectId)}
                          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                          <CheckCircle className="inline w-4 h-4 mr-1" />
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}