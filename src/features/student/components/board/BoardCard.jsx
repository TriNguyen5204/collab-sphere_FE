import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDndContext } from '@dnd-kit/core';
import { Clock, AlignLeft, CheckCircle2, Circle } from 'lucide-react';

const BoardCard = ({ card, listId, onClick, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(card.id),
    data: { type: 'card', listId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue = card.dueAt && new Date(card.dueAt) < new Date() && !card.isDone;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    const updatedCard = { ...card, isCompleted: !card.isCompleted };
    onUpdate(updatedCard); // pass only the updated card
  };

  const { over, active } = useDndContext();
  const isOverThisCard = String(over?.id) === String(card.id) && String(active?.id) !== String(card.id);

  // Get risk color
  const getRiskColor = () => {
    if (!card.riskLevel) return 'bg-gray-200';
    switch (card.riskLevel) {
      case 'high': return 'bg-red-500';
      case 'normal': return 'bg-yellow-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 overflow-hidden ${
        isDragging ? 'shadow-xl rotate-3 scale-105' : ''
      } ${isOverThisCard ? 'ring-2 ring-blue-400 scale-105' : ''} ${
        card.isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* 1st line: Risk label color */}
      <div className={`h-2 ${getRiskColor()}`}></div>

      <div className="p-3">
        {/* 2nd line: Checkbox and Title */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={handleCheckboxClick}
            onPointerDownCapture={(e) => e.stopPropagation()} // avoid DnD grabbing the event
            className="mt-0.5 flex-shrink-0 transition-all duration-200 hover:scale-110"
            type="button"
          >
            {card.isCompleted ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <Circle size={20} className="text-gray-400 hover:text-gray-600" />
            )}
          </button>
          
          <h3 className={`font-semibold text-gray-800 flex-1 ${
            card.isCompleted ? 'line-through opacity-70' : ''
          }`}>
            {card.title}
          </h3>
        </div>

        {/* 3rd line: Due time and description icon */}
        <div className="flex items-center gap-3 mb-2 text-xs">
          {card.dueAt && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                card.isDone === true
                  ? 'bg-green-100 text-green-700'
                  : isOverdue
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Clock size={14} />
              <span className="font-medium">
                {new Date(card.dueAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {card.description && (
            <div className="text-gray-400">
              <AlignLeft size={16} />
            </div>
          )}
        </div>

        {/* 4th line: Assigned members avatars - align right */}
        {card.assignedMembers && card.assignedMembers.length > 0 && (
          <div className="flex -space-x-2 justify-end">
            {card.assignedMembers.slice(0, 3).map((member) => (
              <img
                key={member.studentId}
                src={member.avatarImg}
                alt={member.studentName}
                title={member.studentName}
                className="w-7 h-7 rounded-full ring-2 ring-white object-cover"
              />
            ))}
            {card.assignedMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
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
