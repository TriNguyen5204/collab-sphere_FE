import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Users, BookOpen } from 'lucide-react';

const StudentClassProjectsPage = () => {
  const { classSlug } = useParams();
  const { state } = useLocation();
  const [details] = useState(state?.details || null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  const toggleProject = (id) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDescription = (description) => {
    if (!description) return null;
    
    // Split by \n and create structured content
    const lines = description.split('\n').filter(line => line.trim());
    return lines;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className=" mx-auto px-8 py-6">
          <Link 
            to="/student/classes" 
            className="inline-flex items-center gap-2 text-orangeFpt-500 hover:text-orangeFpt-600 font-medium mb-4 transition"
          >
            <ArrowLeft size={18} />
            Back to classes
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {details?.className || classSlug}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen size={18} />
                <span className="text-lg">
                  {details?.projectAssignments?.length ?? 0} Project Assignment{(details?.projectAssignments?.length ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className=" mx-auto px-8 py-8">
        {details ? (
          details?.projectAssignments?.length ? (
            <div className="space-y-4">
              {details.projectAssignments.map((p) => {
                const descriptionLines = formatDescription(p.description);
                const isExpanded = expandedProjects.has(p.projectAssignmentId);
                const hasLongDescription = descriptionLines && descriptionLines.length > 3;
                
                return (
                  <div 
                    key={p.projectAssignmentId} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
                  >
                    {/* Project Header */}
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {p.projectName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>Assigned: {new Date(p.assignedDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        </div>
                        <div className="shrink-0 bg-orange-100 text-orangeFpt-500 px-4 py-2 rounded-full text-sm font-medium">
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Project Description */}
                    {descriptionLines && descriptionLines.length > 0 && (
                      <div className="p-6 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText size={18} className="text-gray-500" />
                          <h4 className="font-semibold text-gray-900">Project Description</h4>
                        </div>
                        
                        <div className="prose max-w-none">
                          {descriptionLines.map((line, idx) => {
                            // Show first 3 lines, or all if expanded
                            if (!isExpanded && idx >= 3) return null;
                            
                            const trimmedLine = line.trim();
                            
                            // Handle headers (lines ending with :)
                            if (trimmedLine.endsWith(':') && trimmedLine.toUpperCase() === trimmedLine) {
                              return (
                                <h5 key={idx} className="text-base font-bold text-gray-900 mt-4 mb-2">
                                  {trimmedLine}
                                </h5>
                              );
                            }
                            
                            // Handle bullet points (lines starting with -)
                            if (trimmedLine.startsWith('-')) {
                              return (
                                <div key={idx} className="flex gap-2 mb-2 ml-4">
                                  <span className="text-orangeFpt-500 font-bold mt-1">•</span>
                                  <p className="text-gray-700 text-sm leading-relaxed flex-1">
                                    {trimmedLine.substring(1).trim()}
                                  </p>
                                </div>
                              );
                            }
                            
                            // Regular paragraphs
                            return (
                              <p key={idx} className="text-gray-700 text-sm leading-relaxed mb-3">
                                {trimmedLine}
                              </p>
                            );
                          })}
                        </div>

                        {/* Show More/Less Button */}
                        {hasLongDescription && (
                          <button
                            onClick={() => toggleProject(p.projectAssignmentId)}
                            className="mt-4 text-orangeFpt-500 hover:text-orangeFpt-600 text-sm font-medium transition"
                          >
                            {isExpanded ? '↑ Show less' : `↓ Show more (${descriptionLines.length - 3} more lines)`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Assigned</h3>
                <p className="text-gray-600">
                  There are currently no project assignments for this class. Check back later for updates.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Data Available</h3>
              <p className="text-yellow-700">
                Please navigate to this page from the Class view to see project assignments.
              </p>
              <Link 
                to="/student/classes"
                className="inline-block mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
              >
                Go to Classes
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassProjectsPage;
