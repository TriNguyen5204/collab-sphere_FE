import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectBoardViewMenu from "../student/ProjectBoardViewMenu";
import ProjectMemberAvatars from "../student/ProjectMemberAvatars";
import ProjectBoardSetting from "../student/ProjectBoardSetting";
import { LogOut } from 'lucide-react';
import useTeam from "../../context/useTeam";
import ProjectResourcesMenu from "./ProjectResourcesMenu";
import { useAvatar } from "../../hooks/useAvatar";

const ProjectBoardHeader = ({ archivedItems, onRestoreArchived, onDeleteArchived, workspaceName }) => {
  const navigate = useNavigate();
  const { clearTeam, team } = useTeam();
  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(team?.teamName, team?.teamImage);
  return (
    <header className="sticky top-0 z-30 bg-white shadow p-4 flex items-center justify-between pl-6 pr-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {shouldShowImage ? (
          <img
            src={team?.teamImage}
            alt={team?.teamName || "Project Avatar"}
            onError={() => setImageError(true)}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${colorClass} border`}>
            {initials}
          </div>
        )}
        <h1 className="text-2xl font-bold">{team?.projectInfo?.projectName || "Workspace"}</h1>
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
