import React, { useState } from 'react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import TrelloBoard from '../../../components/student/board/TrelloBoard';
import { Filter, CheckCircle } from 'lucide-react';

const ProjectBoard = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const roles = ['all', 'Frontend', 'Backend', 'UI/UX', 'QA', 'DevOps'];

  return (
    <div className="min-h-screen min-w-full" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader className=" fixed top-0 left-0 right-0 z-10" />
      
      <main className="p-6 overflow-auto min-h-screen">
        {/* Role Filter */}
        <div className="mb-4 flex items-center justify-between min-w-full">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
            <p className="text-gray-600 text-sm mt-1">Organize and track your tasks</p>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition border border-gray-200"
            >
              <Filter size={20} />
              <span className="font-medium">
                {selectedRole === 'all' ? 'All Roles' : selectedRole}
              </span>
            </button>

            {/* Popup Menu */}
            {showRoleFilter && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleFilter(false)}
                />
                
                {/* Popup */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Filter size={18} />
                      Filter by Role
                    </h3>
                  </div>
                  
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setShowRoleFilter(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center justify-between ${
                          selectedRole === role
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                        {selectedRole === role && (
                          <CheckCircle size={18} className="text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {selectedRole !== 'all' && (
                    <div className="p-2 border-t">
                      <button
                        onClick={() => {
                          setSelectedRole('all');
                          setShowRoleFilter(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="inline-block min-w-full">
          <TrelloBoard selectedRole={selectedRole} />
        </div>
      </main>
    </div>
  );
};

export default ProjectBoard;