import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Archive,
  Pencil,
  CheckCircle,
} from 'lucide-react';
import BoardCard from './BoardCard';
import useClickOutside from '../../../hooks/useClickOutside';
import CreateCardModal from './CreateCardModal.jsx';
import { useSignalRContext } from '../../../context/kanban/useSignalRContext.js';
import {
  renameList,
  markCardComplete,
} from '../../../hooks/kanban/signalRHelper.js';
import { sortCardsByPosition } from '../../../utils/sortHelper';

const BoardList = ({
  list,
  members,
  onCardClick,
  onUpdateCard,
  workspaceId,
  onCardCreated,
}) => {
  const { connection, isConnected } = useSignalRContext();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);

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
    id: String(list.id),
    data: { type: 'list' },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `cards-${String(list.id)}`,
    data: { type: 'cards', listId: String(list.id) },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === list.title) {
      setIsEditingTitle(false);
      setEditedTitle(list.title);
      return;
    }

    try {
      await renameList(
        connection,
        workspaceId,
        parseInt(list.id),
        editedTitle.trim()
      );
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error renaming list:', error);
      alert('Failed to rename list');
      setEditedTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  const handleMarkAllDone = async () => {
    if (!window.confirm('Mark all cards in this list as done?')) return;

    try {
      const promises = list.cards
        .filter(c => !c.isCompleted)
        .map(card =>
          markCardComplete(
            connection,
            workspaceId,
            parseInt(list.id),
            parseInt(card.id),
            true
          )
        );

      await Promise.all(promises);
      setShowMenu(false);
    } catch (error) {
      console.error('Error marking cards as done:', error);
      alert('Failed to mark all cards as done');
    }
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
      <div className='flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3'>
        <button
          className='cursor-grab active:cursor-grabbing rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600'
          type='button'
        >
          <GripVertical size={20} />
        </button>
        {isEditingTitle ? (
          <div className='w-full flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md'>
            {/* Input edit title */}
            <input
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  setEditedTitle(list.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              disabled={!isConnected}
              className='
                w-full
                px-3 py-2
                text-sm
                rounded-md
                border border-gray-300
                bg-gray-50
                focus:bg-white
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-300
                outline-none
              '
              placeholder='Enter list title...'
            />

            {/* Buttons */}
            <div className='flex items-center gap-2'>
              <button
                onClick={handleSaveTitle}
                className='
                  px-4 py-1.5
                  bg-blue-600 text-white
                  rounded-md
                  text-sm
                  hover:bg-blue-700
                  transition
                '
              >
                Save
              </button>

              <button
                onClick={() => {
                  setEditedTitle(list.title);
                  setIsEditingTitle(false);
                }}
                className='
                  px-4 py-1.5
                  bg-gray-200 text-gray-700
                  rounded-md
                  text-sm
                  hover:bg-gray-300
                  transition
                '
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Normal title view
          <h3
            className='
              font-semibold text-lg truncate
              cursor-pointer
              px-2 py-1
              hover:bg-gray-200 rounded-md
              transition
            '
            onClick={() => setIsEditingTitle(true)}
            title={list.title}
          >
            {list.title}
          </h3>
        )}

        <div className='relative'>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className='rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600'
            type='button'
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <>
              <div
                className='fixed inset-0 z-40'
                onClick={() => setShowMenu(false)}
              />
              <div
                ref={menuRef}
                className='absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl z-50'
              >
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  disabled={!isConnected}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-indigo-50 disabled:opacity-50'
                >
                  <Pencil size={16} />
                  Rename List
                </button>
                <button
                  onClick={handleMarkAllDone}
                  disabled={!isConnected}
                  className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-green-600 transition-colors hover:bg-emerald-50 disabled:opacity-50'
                >
                  <CheckCircle size={16} />
                  Mark All Done
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
        <SortableContext
          items={sortCardsByPosition(list.cards.filter(c => !c.archived)).map(c => String(c.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-3'>
            {sortCardsByPosition(list.cards).map(card => (
              <BoardCard
                key={card.id}
                card={card}
                listId={list.id}
                onClick={() => onCardClick(card, list)}
                onUpdate={updated => onUpdateCard(list.id, updated)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Add card composer */}
        {!isAddingCard && (
          <button
            onClick={() => setIsAddingCard(true)}
            disabled={!isConnected}
            className='mt-2 w-full rounded-lg px-3 py-2 text-left text-gray-600 hover:bg-gray-200/70 text-sm disabled:opacity-50'
            type='button'
          >
            + Add new card
          </button>
        )}
      </div>
      {isAddingCard && (
        <CreateCardModal
          isOpen={isAddingCard}
          onClose={() => setIsAddingCard(false)}
          listId={list.id}
          workspaceId={workspaceId}
          members={members}
          list={list}
          onCardCreated={onCardCreated}
        />
      )}
    </div>
  );
};

export default BoardList;
