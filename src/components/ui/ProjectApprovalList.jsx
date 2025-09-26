import React, { useState } from "react";

export default function ProjectApprovalList({ projects, subjects, onApprove, onReject }) {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeFilter, setActiveFilter] = useState("pending"); // "pending", "approved", "rejected", "all"

  // Filter projects based on active filter
  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    return project.status === activeFilter;
  });

  // Find subject by ID for outcome details
  const getSubjectById = (id) => {
    return subjects.find(s => s.SubjectId === id);
  };

  // Get outcome details for alignment checking
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-900">Project Approval Requests</h2>
        
        <div className="bg-white rounded-md border border-gray-200 inline-flex">
          <button 
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 text-sm font-medium ${activeFilter === "pending" 
              ? "bg-indigo-50 text-indigo-700" 
              : "text-gray-700 hover:bg-gray-50"}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveFilter("approved")}
            className={`px-4 py-2 text-sm font-medium ${activeFilter === "approved" 
              ? "bg-green-50 text-green-700" 
              : "text-gray-700 hover:bg-gray-50"}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setActiveFilter("rejected")}
            className={`px-4 py-2 text-sm font-medium ${activeFilter === "rejected" 
              ? "bg-red-50 text-red-700" 
              : "text-gray-700 hover:bg-gray-50"}`}
          >
            Rejected
          </button>
          <button 
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium ${activeFilter === "all" 
              ? "bg-gray-100 text-gray-800" 
              : "text-gray-700 hover:bg-gray-50"}`}
          >
            All
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-gray-500">No {activeFilter !== "all" ? activeFilter : ""} projects found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <div key={project.projectId} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      project.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{project.subjectCode}</span> • {project.syllabusName}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Submitted by {project.lecturer} on {new Date(project.submissionDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-3 md:mt-0">
                  <button
                    onClick={() => setExpandedProjectId(expandedProjectId === project.projectId ? null : project.projectId)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    {expandedProjectId === project.projectId ? "Hide Details" : "Review Details"}
                  </button>
                </div>
              </div>
              
              {expandedProjectId === project.projectId && (
                <div className="border-t border-gray-200 p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Project Description</h4>
                    <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Learning Outcome Alignment</h4>
                    <div className="mt-2 space-y-3">
                      {project.learningOutcomeAlignment.map(alignment => (
                        <div key={alignment.outcomeId} className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm font-medium text-gray-900">
                            Learning Outcome: {getOutcomeDetails(project.subjectId, alignment.outcomeId)}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Alignment:</span> {alignment.alignmentDescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {project.status === "pending" && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                          Feedback (optional)
                        </label>
                        <textarea
                          id="feedback"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Add your feedback or comments here"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleReject(project.projectId)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(project.projectId)}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Approve
                        </button>
                      </div>
                    </>
                  )}
                  
                  {project.status !== "pending" && project.feedback && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Feedback</h4>
                      <p className="mt-1 text-sm text-gray-600">{project.feedback}</p>
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