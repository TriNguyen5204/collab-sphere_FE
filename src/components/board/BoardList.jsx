import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import BoardCard from './BoardCard';

const BoardList = ({ list, onAddCard, onCardClick, onUpdateCard }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list' }
  });

  // Use a unique droppable id for the CARDS area
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `cards-${list.id}`,
    data: { type: 'cards', listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { active, over } = useDndContext();
  const isCardOverThisList = isOver && active?.data?.current?.type === 'card';

  // Only highlight when list is dragged over another list (not over cards area)
  const isListOver = 
    over?.id === list.id && 
    active?.data?.current?.type === 'list' && 
    active?.id !== list.id;

  const listContainerClasses = `
    px-2 pb-2 min-h-[100px] transition
    ${isCardOverThisList ? 'ring-2 ring-sky-500/60 rounded-md scale-[1.01] bg-gray-700/60' : ''}
  `;

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex-shrink-0 w-72 bg-gray-700 rounded-lg flex flex-col transition-all ${
        isListOver ? 'ring-2 ring-sky-500/60' : ''
      }`}
    >
      {/* List Header - This is the sortable handle for list reordering */}
      <div
        {...attributes}
        {...listeners}
        className="px-3 py-2 cursor-grab active:cursor-grabbing"
      >
        <h3 className="font-semibold text-white">{list.title}</h3>
      </div>

      {/* Cards Container */}
      <div ref={setDroppableRef} className={listContainerClasses}>
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {list.cards.map(card => (
              <BoardCard
                key={card.id}
                card={card}
                listId={list.id}
                onClick={() => onCardClick(card)}
                onUpdate={onUpdateCard}
              />
            ))}
          </div>
        </SortableContext>

        {/* Add Card Form */}
        {isAddingCard ? (
          <form onSubmit={handleAddCard} className="mt-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onBlur={() => !newCardTitle.trim() && setIsAddingCard(false)}
              placeholder="Enter a title for this card..."
              className="w-full px-3 py-2 bg-gray-600 text-white rounded border-2 border-blue-500 focus:outline-none resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCard(false)}
                className="px-3 py-1 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full mt-2 px-3 py-2 text-gray-300 hover:bg-gray-600 rounded flex items-center gap-2 transition"
          >
            <Plus size={16} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardList;