import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlignLeft, Paperclip, CheckCircle2, Circle } from 'lucide-react';

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
  const isOverThisCard = over?.id === card.id && active?.id !== card.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-xl p-4 cursor-pointer shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200
        ${isDragging ? 'opacity-30 rotate-3 scale-105' : 'opacity-100'}
        ${isOverThisCard ? 'ring-2 ring-blue-400 shadow-2xl' : ''}
        ${card.isCompleted ? 'bg-gray-50' : ''}
      `}
    >
      {/* Checkbox and Title */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={handleCheckboxClick}
          className="mt-0.5 flex-shrink-0 transition-all duration-200 hover:scale-110"
        >
          {card.isCompleted ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Circle size={20} className="text-gray-400 hover:text-blue-500" />
          )}
        </button>
        <h4 className={`font-semibold flex-1 text-gray-800 leading-snug ${
          card.isCompleted ? 'line-through text-gray-400' : ''
        }`}>
          {card.title}
        </h4>
      </div>

      {/* Description Preview */}
      {card.description && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 pl-8">
          <AlignLeft size={14} className="mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{card.description}</p>
        </div>
      )}

      {/* Project Role Tags */}
      {card.assignedMembers && card.assignedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pl-8">
          {[...new Set(card.assignedMembers.flatMap(m => m.tags || []))].map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pl-8">
        {/* Left side - Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          {card.dueDate && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium ${
              card.isCompleted 
                ? 'bg-green-100 text-green-700' 
                : isOverdue 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock size={13} />
              {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}

          {card.attachments?.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium">
              <Paperclip size={13} />
              {card.attachments.length}
            </div>
          )}
        </div>

        {/* Right side - Assigned Members */}
        {card.assignedMembers && card.assignedMembers.length > 0 && (
          <div className="flex -space-x-2">
            {card.assignedMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="relative group"
                title={`${member.name} (${member.role}) - ${member.tags?.join(', ')}`}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
                />
              </div>
            ))}
            {card.assignedMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shadow-md">
                +{card.assignedMembers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardCard;