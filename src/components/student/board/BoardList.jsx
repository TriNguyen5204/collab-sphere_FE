import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { Plus, GripVertical, MoreHorizontal, Archive } from 'lucide-react';
import BoardCard from './BoardCard';
import useClickOutside from '../../../hooks/useClickOutside';

const BoardList = ({ list, onAddCard, onCardClick, onUpdateCard, onArchiveList }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setShowMenu(false));

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

  const handleAddCard = () => {
    const title = newCardTitle.trim();
    if (!title) return;
    onAddCard(list.id, title);
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`w-80 shrink-0 rounded-xl bg-gray-100 p-3 ${isDragging ? 'opacity-80' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* List Header - Drag handle */}
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
        <button
          className="cursor-grab active:cursor-grabbing rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
          type="button"
        >
          <GripVertical size={20} />
        </button>
        <h3 className="flex-1 text-lg font-bold text-gray-800">{list.title}</h3>
        <div className="rounded-full bg-gray-200 px-2.5 py-1 text-sm font-medium text-gray-500">
          {list.cards.filter(c => !c.archived).length}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            type="button"
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl z-50">
                <button
                  onClick={() => {
                    onArchiveList();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <Archive size={16} />
                  Archive List
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards Droppable Area */}
      <div
        ref={setDroppableRef}
        className={`mt-3 space-y-2 ${isOver ? 'bg-blue-50' : ''}`}
      >
        <SortableContext items={list.cards.filter(c => !c.archived).map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {list.cards.filter(c => !c.archived).map(card => (
              <BoardCard
                key={card.id}
                card={card}
                listId={list.id}
                onClick={() => onCardClick(card, list)}
                onUpdate={(updated) => onUpdateCard(list.id, updated)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty placeholder only when no visible (non-archived) cards AND not adding */}
        {(list.cards?.filter(c => !c.archived).length === 0) && !isAddingCard && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-3 py-4 text-center text-sm text-gray-500">
            No cards yet
          </div>
        )}

        {/* Add card composer */}
        {isAddingCard ? (
          <div className="rounded-lg bg-white p-2 shadow-sm border border-gray-200">
            <input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              placeholder="Enter a title for this card…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleAddCard}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-white text-sm hover:bg-blue-700"
                type="button"
              >
                Add card
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-gray-600 hover:bg-gray-200/70 text-sm"
            type="button"
          >
            + Add new card
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardList;