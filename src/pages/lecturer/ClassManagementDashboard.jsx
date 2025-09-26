import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const ClassManagementDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const [classes] = useState([
    {
      id: 'SE109-2025',
      name: 'SE109',
      fullName: 'Software Engineering Fundamentals',
      semester: 'Fall 2025',
      enrolledStudents: 42,
      teams: 9,
      status: 'Active',
      joinCode: 'A9F-3K0',
      lastActivity: '2024-09-20'
    },
    {
      id: 'SE203-2025',
      name: 'SE203',
      fullName: 'Advanced Database Systems',
      semester: 'Fall 2025',
      enrolledStudents: 36,
      teams: 8,
      status: 'Grading',
      joinCode: 'J2X-7PD',
      lastActivity: '2024-09-19'
    },
    {
      id: 'SE301-2026',
      name: 'SE301',
      fullName: 'Software Architecture & Design',
      semester: 'Spring 2026',
      enrolledStudents: 0,
      teams: 0,
      status: 'Planned',
      joinCode: 'TBD',
      lastActivity: 'Not started'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter classes based on search and status
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cls.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-200';
      case 'grading': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'planned': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleViewClass = (classId) => {
    // Navigate to Screen 07: Class Detail & Resource Management
    navigate(`/lecturer/classes/${classId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Class
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredClasses.map((cls, index) => (
            <div 
              key={cls.id} 
              className="bg-white rounded-xl soft-shadow card-hover border border-gray-100 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                {/* Class Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-bold text-gray-900 text-modern">
                        {cls.name}
                      </h3>
                      <span className="ml-2 text-sm text-gray-500">— {cls.semester}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {cls.fullName}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadgeColor(cls.status)}`}>
                    {cls.status}
                  </span>
                </div>

                {/* Student and Team Info */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    <span>Students: <span className="font-medium text-gray-900">{cls.enrolledStudents}</span></span>
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    <span>Teams: <span className="font-medium text-gray-900">{cls.teams}</span></span>
                  </div>
                </div>

                {/* Join Code */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Join Code</div>
                  <div className="text-sm font-mono font-medium text-gray-900 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg border">
                    {cls.status === 'Planned' ? 'TBD' : cls.joinCode}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewClass(cls.id)}
                    className="flex-1 bg-gray-900 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium btn-modern"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => navigate(`/lecturer/monitoring/${cls.id}`)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    Monitor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassManagementDashboard;