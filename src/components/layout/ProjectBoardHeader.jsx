import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProjectBoardViewMenu from "../student/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../student/ProjectMemberAvatars";
import ProjectStarButton from "../student/ProjectStarButton";
import ProjectMemberPopover from "../student/ProjectMemberPopover";
import ProjectBoardSetting from "../student/ProjectBoardSetting";

const ProjectBoardHeader = () => {
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
    <header className="sticky top-0 z-30 bg-white shadow p-4 flex items-center justify-between pl-6 pr-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{decodeURIComponent(projectName)}</h1>
        <ProjectBoardViewMenu />
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
