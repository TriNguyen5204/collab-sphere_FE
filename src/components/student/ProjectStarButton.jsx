import React from "react";
import { Star } from "lucide-react";

const ProjectStarButton = ({ starred, setStarred }) => {
  return (
    <button onClick={() => setStarred(!starred)} title="Star Project">
      <Star
        className={`w-6 h-6 transition ${
          starred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
        }`}
      />
    </button>
  );
};

export default ProjectStarButton;
