import React, { useState } from "react";
import { CheckCircle, XCircle, Clock, FileText, Target, Calendar, User, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function ProjectApprovalList({ projects, subjects, onApprove, onReject }) {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeFilter, setActiveFilter] = useState("pending");

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    return project.status === activeFilter;
  });

  const getSubjectById = (id) => {
    return subjects.find(s => s.SubjectId === id);
  };

  const getOutcomeDetails = (subjectId, outcomeId) => {
    const subject = getSubjectById(subjectId);
    if (!subject) return "Unknown outcome";
    
    const outcome = subject.Outcomes.find(o => o.SubjectOutcomeId === outcomeId);
    return outcome ? outcome.OutcomeDetail : "Unknown outcome";
  };

  const handleApprove = (projectId) => {
    onApprove(projectId, feedbackText);
    setFeedbackText("");
    setExpandedProjectId(null);
  };

  const handleReject = (projectId) => {
    onReject(projectId, feedbackText);
    setFeedbackText("");
    setExpandedProjectId(null);
  };

  const statusCounts = {
    pending: projects.filter(p => p.status === "pending").length,
    approved: projects.filter(p => p.status === "approved").length,
    rejected: projects.filter(p => p.status === "rejected").length,
    all: projects.length
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Project Approval Requests
          </h2>
          <p className="text-gray-500 mt-1">Review and manage project submissions</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm inline-flex p-1">
          <button 
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeFilter === "pending" 
                ? "bg-yellow-50 text-yellow-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === "pending" ? "bg-yellow-100" : "bg-gray-100"
            }`}>
              {statusCounts.pending}
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter("approved")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeFilter === "approved" 
                ? "bg-green-50 text-green-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === "approved" ? "bg-green-100" : "bg-gray-100"
            }`}>
              {statusCounts.approved}
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter("rejected")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeFilter === "rejected" 
                ? "bg-red-50 text-red-700 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === "rejected" ? "bg-red-100" : "bg-gray-100"
            }`}>
              {statusCounts.rejected}
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeFilter === "all" 
                ? "bg-gray-100 text-gray-800 shadow-sm" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === "all" ? "bg-gray-200" : "bg-gray-100"
            }`}>
              {statusCounts.all}
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No {activeFilter !== "all" ? activeFilter : ""} projects found
          </h3>
          <p className="text-gray-500">There are no projects matching your current filter</p>
        </div>
      ) : (
        /* Project Cards */
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <div 
              key={project.projectId} 
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
            >
              {/* Project Header */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        project.status === "pending" ? "bg-yellow-100" :
                        project.status === "approved" ? "bg-green-100" :
                        "bg-red-100"
                      }`}>
                        {project.status === "pending" ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : project.status === "approved" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            project.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            project.status === "approved" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-indigo-600">{project.subjectCode}</span>
                            <span className="text-gray-400">•</span>
                            <span>{project.syllabusName}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Submitted by <span className="font-medium text-gray-700">{project.lecturer}</span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(project.submissionDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedProjectId(expandedProjectId === project.projectId ? null : project.projectId)}
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
                        Review Details
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedProjectId === project.projectId && (
                <div className="border-t-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                  <div className="p-6 space-y-6">
                    {/* Project Description */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Project Description
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                    
                    {/* Learning Outcome Alignment */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Learning Outcome Alignment
                      </h4>
                      <div className="space-y-3">
                        {project.learningOutcomeAlignment.map((alignment, index) => (
                          <div key={alignment.outcomeId} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                  Learning Outcome: {getOutcomeDetails(project.subjectId, alignment.outcomeId)}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium text-indigo-600">Alignment:</span> {alignment.alignmentDescription}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pending Actions */}
                    {project.status === "pending" && (
                      <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Action Required</h4>
                            <p className="text-sm text-gray-600">Please review and provide your decision on this project</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="feedback" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Feedback (optional)
                          </label>
                          <textarea
                            id="feedback"
                            rows={4}
                            className="block w-full border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Add your feedback or comments here..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleReject(project.projectId)}
                            className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-300 rounded-lg text-sm font-semibold text-red-700 bg-white hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Project
                          </button>
                          <button
                            onClick={() => handleApprove(project.projectId)}
                            className="flex items-center gap-2 px-5 py-2.5 border-2 border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Project
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Previous Feedback */}
                    {project.status !== "pending" && project.feedback && (
                      <div className={`rounded-lg p-4 border-2 ${
                        project.status === "approved" 
                          ? "bg-green-50 border-green-200" 
                          : "bg-red-50 border-red-200"
                      }`}>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MessageSquare className={`w-4 h-4 ${
                            project.status === "approved" ? "text-green-600" : "text-red-600"
                          }`} />
                          Feedback
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{project.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}