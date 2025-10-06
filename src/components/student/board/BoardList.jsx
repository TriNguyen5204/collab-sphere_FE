import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { Plus, GripVertical } from 'lucide-react';
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

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `cards-${list.id}`,
    data: { type: 'cards', listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { active } = useDndContext();
  const isCardOverThisList = isOver && active?.data?.current?.type === 'card';
  const hasCards = list.cards.length > 0;

  const handleAddCard = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle);
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex-shrink-0 w-80 bg-white rounded-2xl shadow-md flex flex-col ${
        isDragging ? 'opacity-50 ring-2 ring-blue-400 scale-105' : ''
      }`}
    >
      {/* List Header - Drag handle */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl flex-shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-white rounded-lg"
          type="button"
        >
          <GripVertical size={20} />
        </button>
        <h3 className="font-bold text-gray-800 flex-1 text-lg">{list.title}</h3>
        <div className="text-sm font-medium text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">
          {list.cards.length}
        </div>
      </div>

      {/* Cards Droppable Area */}
      <div
        ref={setDroppableRef}
        className={`px-3 transition-all ${
          hasCards || isCardOverThisList ? 'py-3' : 'py-2'
        } ${
          isCardOverThisList ? 'bg-blue-50/50 ring-2 ring-blue-300 ring-inset' : ''
        }`}
      >
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {list.cards.map(card => (
              <BoardCard
                key={card.id}
                card={card}
                listId={list.id}
                onClick={() => onCardClick(card)}
                onUpdate={onUpdateCard}
              />
            ))}
            {!hasCards && !isCardOverThisList && (
              <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                No cards yet
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Footer - Add Card Button */}
      <div className="px-3 pb-3 border-t border-gray-100 pt-3 flex-shrink-0">
        {isAddingCard ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                } else if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
              onBlur={() => {
                if (!newCardTitle.trim()) {
                  setIsAddingCard(false);
                }
              }}
              placeholder="Enter a title for this card..."
              className="w-full px-3 py-2 bg-white text-gray-800 rounded-lg border-2 border-blue-400 focus:outline-none resize-none shadow-sm"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm hover:shadow transition-all"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            data-type="add-card"
            className="w-full px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border-2 border-dashed border-gray-200 hover:border-gray-300"
          >
            <Plus size={18} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardList;