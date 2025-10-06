import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import BoardList from './BoardList';
import CardModal from './CardModal';

// Updated members structure
export const members = [
  { id: 1, name: "Alice", role: "Leader", avatar: "https://i.pravatar.cc/40?u=1", tags: ["Frontend Engineer", "UI/UX Designer"] },
  { id: 2, name: "Bob", role: "Member", avatar: "https://i.pravatar.cc/40?u=2", tags: ["Backend Engineer"] },
  { id: 3, name: "Charlie", role: "Member", avatar: "https://i.pravatar.cc/40?u=3", tags: ["Frontend Engineer"] },
  { id: 4, name: "Diana", role: "Member", avatar: "https://i.pravatar.cc/40?u=4", tags: ["UI/UX Designer"] },
  { id: 5, name: "Eve", role: "Member", avatar: "https://i.pravatar.cc/40?u=5", tags: ["QA Engineer"] },
  { id: 6, name: "Frank", role: "Member", avatar: "https://i.pravatar.cc/40?u=6", tags: ["Backend Engineer", "DevOps"] },
];

const TrelloBoard = () => {
  const [lists, setLists] = useState([
    {
      id: 'list-1',
      title: 'To Do',
      cards: [
        { 
          id: 'card-1', 
          title: 'Design homepage', 
          description: 'Create wireframes and mockups for the landing page',
          assignedMembers: [members[0], members[3]], 
          dueDate: '2025-10-10', 
          isCompleted: false, 
          attachments: [] 
        }
      ]
    },
    {
      id: 'list-2',
      title: 'In Progress',
      cards: [
        { 
          id: 'card-2', 
          title: 'Implement API endpoints', 
          description: 'Build REST API for user authentication',
          assignedMembers: [members[1], members[5]], 
          dueDate: '2025-10-08', 
          isCompleted: false, 
          attachments: [] 
        }
      ]
    },
    {
      id: 'list-3',
      title: 'Done',
      cards: []
    }
  ]);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingCardListId, setEditingCardListId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddList = (e) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      setLists([...lists, {
        id: `list-${Date.now()}`,
        title: newListTitle.trim(),
        cards: []
      }]);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleAddCard = (listId, cardTitle) => {
    if (!cardTitle.trim()) return;
    
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, {
            id: `card-${Date.now()}`,
            title: cardTitle.trim(),
            description: '',
            assignedMembers: [],
            dueDate: null,
            isCompleted: false,
            attachments: []
          }]
        };
      }
      return list;
    }));
  };

  const handleUpdateCard = (listId, updatedCard) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.map(card => 
            card.id === updatedCard.id ? updatedCard : card
          )
        };
      }
      return list;
    }));
  };

  const handleCardClick = (card, listId) => {
    setEditingCard(card);
    setEditingCardListId(listId);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      for (const list of lists) {
        const card = list.cards.find(c => c.id === active.id);
        if (card) {
          setActiveCard(card);
          break;
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Move card (between lists or within)
    if (activeType === 'card') {
      const sourceListId = active.data.current.listId;
      // Determine destination list from target type
      const destListId =
        overType === 'card' 
          ? over.data.current.listId
          : overType === 'cards'
          ? over.data.current.listId
          : null;

      if (!destListId) return;

      setLists((current) => {
        const listsCopy = JSON.parse(JSON.stringify(current));
        const srcList = listsCopy.find(l => l.id === sourceListId);
        const dstList = listsCopy.find(l => l.id === destListId);
        if (!srcList || !dstList) return current;

        const fromIdx = srcList.cards.findIndex(c => c.id === active.id);
        if (fromIdx === -1) return current;
        const [moved] = srcList.cards.splice(fromIdx, 1);

        if (overType === 'card') {
          const toIdx = dstList.cards.findIndex(c => c.id === over.id);
          dstList.cards.splice(toIdx === -1 ? dstList.cards.length : toIdx, 0, moved);
        } else {
          dstList.cards.push(moved);
        }
        return listsCopy;
      });
      return;
    }

    // Reorder lists - only when dragging list over another list (not cards area)
    if (activeType === 'list' && overType === 'list' && active.id !== over.id) {
      setLists((current) => {
        const next = [...current];
        const oldIndex = next.findIndex(l => l.id === active.id);
        const newIndex = next.findIndex(l => l.id === over.id);
        const [movedList] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, movedList);
        return next;
      });
    }
  };

  return (
    <div className="h-full bg-gray-800 p-6 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start">
          <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map(list => (
              <BoardList
                key={list.id}
                list={list}
                onAddCard={handleAddCard}
                onCardClick={(card) => handleCardClick(card, list.id)}
                onUpdateCard={(card) => handleUpdateCard(list.id, card)}
              />
            ))}
          </SortableContext>

          {/* Add List Button */}
          <div className="flex-shrink-0 w-72">
            {isAddingList ? (
              <form onSubmit={handleAddList} className="bg-gray-700 rounded-lg p-3">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onBlur={() => !newListTitle.trim() && setIsAddingList(false)}
                  placeholder="Enter list title..."
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded border-2 border-blue-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add list
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingList(false)}
                    className="px-3 py-1 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Add another list
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-gray-700 text-white rounded-lg p-3 shadow-2xl rotate-3 w-72">
              <p className="font-medium">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {editingCard && editingCardListId && (
        <CardModal
          card={editingCard}
          listId={editingCardListId}
          onClose={() => {
            setEditingCard(null);
            setEditingCardListId(null);
          }}
          onUpdate={handleUpdateCard}
          availableMembers={members}
        />
      )}
    </div>
  );
};

export default TrelloBoard;