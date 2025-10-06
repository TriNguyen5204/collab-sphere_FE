import React from "react";

const members = [
  { id: 1, name: "Alice", role: "Leader", avatar: "https://i.pravatar.cc/40?u=1" },
  { id: 2, name: "Bob", role: "Member", avatar: "https://i.pravatar.cc/40?u=2" },
  { id: 3, name: "Charlie", role: "Member", avatar: "https://i.pravatar.cc/40?u=3" },
  { id: 4, name: "Diana", role: "Member", avatar: "https://i.pravatar.cc/40?u=4" },
  { id: 5, name: "Eve", role: "Member", avatar: "https://i.pravatar.cc/40?u=5" },
  { id: 6, name: "Frank", role: "Member", avatar: "https://i.pravatar.cc/40?u=6" },
];

const ProjectMemberAvatars = ({ onSelect }) => {
  const maxVisible = 5;
  const visibleMembers = members.slice(0, maxVisible);
  const hiddenCount = members.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visibleMembers.map((m) => (
        <button
          key={m.id}
          onClick={(e) => onSelect(m, e.currentTarget)}
          className="relative group"
          title={m.name}
        >
          <img
            src={m.avatar}
            alt={m.name}
            className="w-8 h-8 rounded-full  group-hover:brightness-75 hover:ring-1 hover:ring-gray-800 transition"
          />
        </button>
      ))}
      {hiddenCount > 0 && (
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium hover:bg-gray-400 transition">
          +{hiddenCount}
        </button>
      )}
    </div>
  );
};

export default ProjectMemberAvatars;
