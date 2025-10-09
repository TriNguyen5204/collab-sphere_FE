import React, { useState } from 'react';
import { Download, LogOut, BookOpen, FileText, Users, Calendar } from 'lucide-react';
import Header from '../../components/layout/Header';
import StudentSidebar from '../../components/layout/StudentSidebar';

const StudentClassPage = () => {
  const [classes, setClasses] = useState([
    {
      id: 1,
      code: 'CS301',
      name: 'Software Engineering',
      lecturer: 'Dr. Smith',
      semester: 'Fall 2025',
      studentCount: 45,
      resources: [
        { id: 1, name: 'Lecture 1 - Introduction.pdf', size: '2.5 MB', uploadDate: '2025-09-15' },
        { id: 2, name: 'Assignment 1.docx', size: '1.2 MB', uploadDate: '2025-09-20' },
      ]
    },
    {
      id: 2,
      code: 'CS402',
      name: 'Database Systems',
      lecturer: 'Prof. Johnson',
      semester: 'Fall 2025',
      studentCount: 38,
      resources: [
        { id: 3, name: 'SQL Basics.pdf', size: '3.1 MB', uploadDate: '2025-09-16' },
      ]
    },
  ]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [classToLeave, setClassToLeave] = useState(null);

  const handleLeaveClass = (classItem) => {
    setClassToLeave(classItem);
    setShowLeaveModal(true);
  };

  const confirmLeaveClass = () => {
    setClasses(classes.filter(c => c.id !== classToLeave.id));
    setShowLeaveModal(false);
    setClassToLeave(null);
    if (selectedClass?.id === classToLeave.id) {
      setSelectedClass(null);
    }
  };

  const handleDownloadResource = (resource) => {
    // Implement download logic
    console.log('Downloading:', resource.name);
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
        <StudentSidebar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">View your enrolled classes and access course resources</p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Class List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Enrolled Classes ({classes.length})
                </h2>
                <div className="space-y-3">
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedClass?.id === classItem.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                      onClick={() => setSelectedClass(classItem)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{classItem.code}</h3>
                          <p className="text-sm text-gray-600">{classItem.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{classItem.studentCount} students</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Class Details & Resources */}
            <div className="lg:col-span-2">
              {selectedClass ? (
                <div className="space-y-6">
                  {/* Class Info Card */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
                        <p className="text-gray-600">{selectedClass.code}</p>
                      </div>
                      <button
                        onClick={() => handleLeaveClass(selectedClass)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Leave Class
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500">Lecturer</p>
                        <p className="font-medium text-gray-900">{selectedClass.lecturer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Semester</p>
                        <p className="font-medium text-gray-900">{selectedClass.semester}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Students Enrolled</p>
                        <p className="font-medium text-gray-900">{selectedClass.studentCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Resources Available</p>
                        <p className="font-medium text-gray-900">{selectedClass.resources.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Resources Library */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Course Resources
                    </h3>
                    <div className="space-y-3">
                      {selectedClass.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-brand-500" />
                            <div>
                              <p className="font-medium text-gray-900">{resource.name}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{resource.size}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(resource.uploadDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadResource(resource)}
                            className="flex items-center gap-2 px-4 py-2 text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      ))}
                      {selectedClass.resources.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No resources available yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Class</h3>
                  <p className="text-gray-600">Choose a class from the list to view details and resources</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Leave Class Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Leave Class</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave <strong>{classToLeave?.name}</strong>? You will lose access to all course resources and materials.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveClass}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Class
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentClassPage;