import React from "react";
import CheckpointGroup from "./CheckpointGroup";

const MilestoneColumn = ({ milestone }) => (
  <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0 space-y-4">
    <h3 className="font-bold text-lg">{milestone.title}</h3>
    {milestone.checkpoints.map((cp) => (
      <CheckpointGroup key={cp.checkpointId} checkpoint={cp} />
    ))}
  </div>
);

export default MilestoneColumn;
