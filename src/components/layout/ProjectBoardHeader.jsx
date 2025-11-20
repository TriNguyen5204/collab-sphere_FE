import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectBoardViewMenu from "../student/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../student/ProjectMemberAvatars";
import ProjectBoardSetting from "../student/ProjectBoardSetting";
import { LogOut } from 'lucide-react';
import useTeam from "../../context/useTeam";
import ProjectResourcesMenu from "./ProjectResourcesMenu";

const ProjectBoardHeader = ({ archivedItems, onRestoreArchived, onDeleteArchived }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const { clearTeam, team } = useTeam();
  return (
    <header className="sticky top-0 z-30 bg-white shadow p-4 flex items-center justify-between pl-6 pr-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <img
          src={team?.teamImage}
          alt="Project Avatar"
          className="w-10 h-10 rounded-full object-cover border"
        />
        <h1 className="text-2xl font-bold">{projectName}</h1>
        <ProjectBoardViewMenu />
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <ProjectMemberAvatars />
        <ProjectResourcesMenu />
        <ProjectBoardSetting
          archivedItems={archivedItems}
          onRestoreArchived={onRestoreArchived}
          onDeleteArchived={onDeleteArchived}
        />
        <button
          onClick={() => navigate('/student/projects')
            .then(() => clearTeam())
          }
          className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
          title="Exit project"
          aria-label="Exit project"
        >
          <LogOut className="mr-1" size={16} />
        </button>
      </div>
    </header>
  );
};

export default ProjectBoardHeader;
