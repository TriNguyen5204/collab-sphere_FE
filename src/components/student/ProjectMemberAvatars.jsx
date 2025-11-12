import React from "react";
import useTeam from "../../context/useTeam";

const ProjectMemberAvatars = ({ onSelect }) => {
  const { team } = useTeam();
  const rawMembers = team?.memberInfo?.members ?? [];
  const maxVisible = 5;
  const visibleMembers = rawMembers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, rawMembers.length - maxVisible);

  return (
    <div className="flex -space-x-2">
      {visibleMembers.map((m) => {
        const displayMember = {
          id: m.studentId,
          name: m.studentName,
          role: m.teamRole === 1 ? "Leader" : "Member",
          avatar: m.avatar,
        };
        return (
        <button
          key={m.studentId}
          onClick={(e) => onSelect(displayMember, e.currentTarget)}
          className="relative group"
          title={displayMember.name}
        >
          <img
            src={m.avatar}
            alt={displayMember.name}
            className="w-8 h-8 rounded-full bg-white object-cover border group-hover:brightness-75 hover:ring-1 hover:ring-gray-800 transition"
          />
        </button>
        );
      })}
      {hiddenCount > 0 && (
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium hover:bg-gray-400 transition">
          +{hiddenCount}
        </button>
      )}
    </div>
  );
};

export default ProjectMemberAvatars;
