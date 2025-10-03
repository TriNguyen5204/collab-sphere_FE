import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

const CheckpointGroup = ({ checkpoint }) => {
  const { setNodeRef } = useDroppable({ id: checkpoint.checkpointId });

  return (
    <div className="bg-white p-3 rounded-md shadow">
      <h4 className="font-semibold mb-3">{checkpoint.title}</h4>
      <SortableContext
        items={checkpoint.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-2 min-h-[50px]">
          {checkpoint.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default CheckpointGroup;
