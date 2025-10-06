import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ProjectBoardViewMenu from "../ui/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../ui/ProjectMemberAvatars";
import ProjectStarButton from "../ui/ProjectStarButton";
import ProjectMemberPopover from "../ui/ProjectMemberPopover";
import ProjectBoardSetting from "../ui/ProjectBoardSetting";

const ProjectBoardHeader = ({ roles = [], selectedRole = 'all', onChangeRole }) => {
  const { projectName } = useParams();
  const [starred, setStarred] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const handleMemberSelect = (member, anchorEl) => {
    setSelectedMember(member);
    setPopoverAnchor(anchorEl);
  };

  const handleClosePopover = () => {
    setSelectedMember(null);
    setPopoverAnchor(null);
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between pl-6 pr-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{decodeURIComponent(projectName)}</h1>
        <ProjectBoardViewMenu />
        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-sm text-gray-600">Role:</label>
          <select
            id="role-filter"
            value={selectedRole}
            onChange={(e) => onChangeRole?.(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <ProjectMemberAvatars onSelect={handleMemberSelect} />
        <ProjectStarButton starred={starred} setStarred={setStarred} />
        <ProjectBoardSetting />
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
