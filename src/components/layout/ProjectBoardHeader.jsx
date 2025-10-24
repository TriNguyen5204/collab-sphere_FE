import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProjectBoardViewMenu from "../student/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../student/ProjectMemberAvatars";
import ProjectMemberPopover from "../student/ProjectMemberPopover";
import ProjectBoardSetting from "../student/ProjectBoardSetting";
import { Filter, CheckCircle } from 'lucide-react';

const ProjectBoardHeader = ({ selectedRole, onRoleChange, archivedItems, onRestoreArchived, onDeleteArchived }) => {
  const { projectName } = useParams();
  const location = useLocation();
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

        <ProjectMemberAvatars onSelect={handleMemberSelect} />
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
