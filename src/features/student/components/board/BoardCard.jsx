import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDndContext } from '@dnd-kit/core';
import { Clock, AlignLeft, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { markCardComplete } from '../../../../hooks/kanban/signalRHelper';

const BoardCard = ({ card, listId, onClick, workspaceId, connection, isConnected }) => {
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

  const handleCheckboxClick = async (e) => {
    e.stopPropagation();
    
    if (!isConnected || !connection) {
      toast.error('Not connected to server');
      return;
    }

    const newStatus = !card.isCompleted;

    try {
      await markCardComplete(
        connection,
        workspaceId,
        parseInt(listId),
        parseInt(card.id),
        newStatus
      );

      toast.success(newStatus ? 'Card marked as complete' : 'Card marked as incomplete');
    } catch (error) {
      console.error('Error toggling card completion:', error);
      toast.error('Failed to update card status');
    }
  };

  const { over, active } = useDndContext();
  const isOverThisCard = String(over?.id) === String(card.id) && String(active?.id) !== String(card.id);

  // ✅ Calculate due date status with labels
  const getDueDateDisplay = () => {
    if (!card.dueAt) return null;
    
    const dueDate = new Date(card.dueAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format date
    const dateStr = dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    // Determine status
    if (card.isCompleted) {
      return {
        dateStr,
        label: 'Complete',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2
      };
    }
    
    if (diffDays < 0) {
      return {
        dateStr,
        label: 'Overdue',
        color: 'bg-red-100 text-red-700',
        icon: AlertCircle
      };
    }
    
    if (diffDays === 0) {
      return {
        dateStr,
        label: 'Due Today',
        color: 'bg-orange-100 text-orange-700',
        icon: Clock
      };
    }
    
    if (diffDays <= 3) {
      return {
        dateStr,
        label: 'Due Soon',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock
      };
    }
    
    // Upcoming (more than 3 days)
    return {
      dateStr,
      label: null, // Don't show label for future dates
      color: 'bg-blue-100 text-blue-700',
      icon: Clock
    };
  };

  const dueDateDisplay = getDueDateDisplay();

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
            onPointerDownCapture={(e) => e.stopPropagation()}
            disabled={!isConnected}
            className="mt-0.5 flex-shrink-0 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            title={isConnected ? (card.isCompleted ? 'Mark as incomplete' : 'Mark as complete') : 'Offline'}
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

        {/* 3rd line: Due time with status label and description icon */}
        <div className="flex items-center gap-3 mb-2 text-xs">
          {dueDateDisplay && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${dueDateDisplay.color}`}>
                <dueDateDisplay.icon size={14} />
                <span className="font-medium">
                  {dueDateDisplay.dateStr}
                </span>
              </div>
              
              {dueDateDisplay.label && (
                <span className={`px-2 py-1 rounded font-semibold ${dueDateDisplay.color}`}>
                  {dueDateDisplay.label}
                </span>
              )}
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