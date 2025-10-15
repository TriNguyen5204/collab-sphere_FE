import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProjectBoardViewMenu from "../student/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../student/ProjectMemberAvatars";
import ProjectStarButton from "../student/ProjectStarButton";
import ProjectMemberPopover from "../student/ProjectMemberPopover";
import ProjectBoardSetting from "../student/ProjectBoardSetting";
import { Filter, CheckCircle } from 'lucide-react';

const ProjectBoardHeader = ({ selectedRole, onRoleChange, archivedItems, onRestoreArchived, onDeleteArchived }) => {
  const { projectName } = useParams();
  const location = useLocation();
  const [starred, setStarred] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  const handleMemberSelect = (member, anchorEl) => {
    setSelectedMember(member);
    setPopoverAnchor(anchorEl);
  };

  const handleClosePopover = () => {
    setSelectedMember(null);
    setPopoverAnchor(null);
  };

  // Check if we're on a page where the filter should be enabled
  const isFilterEnabled = location.pathname.includes('/board') || location.pathname.includes('/team-workspace');
  
  const roles = ['all', 'Frontend', 'Backend', 'UI/UX', 'QA', 'DevOps'];

  return (
    <header className="sticky top-0 z-30 bg-white shadow p-4 flex items-center justify-between pl-6 pr-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{decodeURIComponent(projectName)}</h1>
        <ProjectBoardViewMenu />
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => isFilterEnabled && setShowRoleFilter(!showRoleFilter)}
            disabled={!isFilterEnabled}
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md transition border border-gray-200 ${
              isFilterEnabled 
                ? 'hover:bg-gray-50 cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            title={!isFilterEnabled ? 'Filter is only available on Board and Team Workspace pages' : ''}
          >
            <Filter size={20} />
            <span className="font-medium">
              {selectedRole === 'all' ? 'All Roles' : selectedRole}
            </span>
          </button>

          {/* Popup Menu */}
          {showRoleFilter && isFilterEnabled && (
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
                        onRoleChange(role);
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
                        onRoleChange('all');
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

        <ProjectMemberAvatars onSelect={handleMemberSelect} />
        <ProjectStarButton starred={starred} setStarred={setStarred} />
        <ProjectBoardSetting 
          archivedItems={archivedItems}
          onRestoreArchived={onRestoreArchived}
          onDeleteArchived={onDeleteArchived}
        />
      </div>

      {/* Member Popover */}
      {selectedMember && popoverAnchor && (
        <ProjectMemberPopover
          member={selectedMember}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
        />
      )}
    </header>
  );
};

export default ProjectBoardHeader;
