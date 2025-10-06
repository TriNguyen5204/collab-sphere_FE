import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlignLeft, Paperclip } from 'lucide-react';

const BoardCard = ({ card, listId, onClick, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', listId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.isCompleted;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    const updatedCard = { ...card, isCompleted: !card.isCompleted };
    onUpdate(updatedCard);
  };

  const { over, active } = useDndContext();

  // Add a frame highlight when this card is the current drop target
  const isOverThisCard = over?.id === card.id && active?.id !== card.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-600 text-white rounded-lg p-3 cursor-pointer shadow-sm transition
        hover:bg-gray-550
        ${isDragging ? 'opacity-30' : 'opacity-100'}
        ${isOverThisCard ? 'ring-2 ring-sky-500/70' : ''}
      `}
    >
      {/* Checkbox and Title */}
      <div className="flex items-start gap-2 mb-2">
        <input
          type="checkbox"
          checked={card.isCompleted}
          onChange={handleCheckboxClick}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded cursor-pointer"
        />
        <p className={`font-medium flex-1 ${card.isCompleted ? 'line-through text-gray-400' : ''}`}>
          {card.title}
        </p>
      </div>

      {/* Description Preview */}
      {card.description && (
        <div className="flex items-center gap-1 text-xs text-gray-300 mb-2">
          <AlignLeft size={12} />
          <span className="truncate">{card.description}</span>
        </div>
      )}

      {/* Assigned Members */}
      {card.assignedMembers && card.assignedMembers.length > 0 && (
        <div className="flex -space-x-2 mb-2">
          {card.assignedMembers.map((member) => (
            <img
              key={member.id}
              src={member.avatar}
              alt={member.name}
              title={`${member.name} (${member.role}) - ${member.tags?.join(', ')}`}
              className="w-6 h-6 rounded-full border-2 border-gray-600"
            />
          ))}
        </div>
      )}

      {/* Project Role Tags */}
      {card.assignedMembers && card.assignedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {[...new Set(card.assignedMembers.flatMap(m => m.tags || []))].map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        {card.dueDate && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            card.isCompleted ? 'bg-green-600' : isOverdue ? 'bg-red-600' : 'bg-gray-500'
          }`}>
            <Clock size={12} />
            {new Date(card.dueDate).toLocaleDateString()}
          </div>
        )}

        {card.attachments?.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500">
            <Paperclip size={12} />
            {card.attachments.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardCard;