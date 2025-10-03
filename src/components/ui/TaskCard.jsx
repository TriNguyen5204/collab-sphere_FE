import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TaskCard = ({ task, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Trello-like style for the overlay card
  if (isOverlay) {
    return (
      <div className="bg-gray-50 border rounded-md p-3 shadow-lg rotate-3">
        <p className="text-sm">{task.title}</p>
        <p className="text-xs text-gray-500 mt-1">Assignee: {task.assignee}</p>
      </div>
    );
  }

  // Style for the original card in the list
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-50 border rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <p className="text-sm">{task.title}</p>
      <p className="text-xs text-gray-500 mt-1">Assignee: {task.assignee}</p>
    </div>
  );
};

export default TaskCard;
