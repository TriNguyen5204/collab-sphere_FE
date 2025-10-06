import React, { useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import BoardList from "./BoardList";
import CardModal from "./CardModal";

// ────────────────────────────────────────────────────────────────────────────────
// Fake members (re‑use across cards)
export const members = [
  { id: 1, name: "Alice", role: "Leader", avatar: "https://i.pravatar.cc/40?u=1", tags: ["Frontend", "UI/UX"] },
  { id: 2, name: "Bob", role: "Member", avatar: "https://i.pravatar.cc/40?u=2", tags: ["Backend"] },
  { id: 3, name: "Charlie", role: "Member", avatar: "https://i.pravatar.cc/40?u=3", tags: ["Frontend"] },
  { id: 4, name: "Diana", role: "Member", avatar: "https://i.pravatar.cc/40?u=4", tags: ["UI/UX"] },
  { id: 5, name: "Eve", role: "Member", avatar: "https://i.pravatar.cc/40?u=5", tags: ["QA"] },
  { id: 6, name: "Frank", role: "Member", avatar: "https://i.pravatar.cc/40?u=6", tags: ["Backend", "DevOps"] },
];

// ────────────────────────────────────────────────────────────────────────────────
// Initial lists data
const initialLists = [
  {
    id: "list-1",
    title: "To Do",
    cards: [
      {
        id: "card-1",
        title: "Design homepage",
        description: "Create wireframes + hero section mockups",
        assignedMemberIds: [1, 4],
        dueDate: "2025-10-10",
        isCompleted: false,
        attachments: [],
        milestones: [
          {
            id: "ms-1",
            title: "UI Skeleton",
            checkpoints: [
              { id: "cp-1", title: "Header/Navigation", done: false },
              { id: "cp-2", title: "Hero layout", done: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "list-2",
    title: "In Progress",
    cards: [
      {
        id: "card-2",
        title: "Implement auth API",
        description: "Login / Register / Refresh token endpoints",
        assignedMemberIds: [2, 6],
        dueDate: "2025-10-08",
        isCompleted: false,
        attachments: [],
        milestones: [
          {
            id: "ms-2",
            title: "JWT flow",
            checkpoints: [
              { id: "cp-3", title: "Access/Refresh model", done: true },
              { id: "cp-4", title: "Role guard", done: false },
            ],
          },
        ],
      },
      {
        id: "card-3",
        title: "Kanban DnD",
        description: "Drag & drop lists + cards with dnd-kit",
        assignedMemberIds: [1, 3],
        dueDate: "2025-10-12",
        isCompleted: false,
        attachments: [],
        milestones: [],
      },
    ],
  },
  { id: "list-3", title: "Review", cards: [] },
  { id: "list-4", title: "Done", cards: [] },
];

export default function TrelloBoard() {
  const [lists, setLists] = useState(initialLists);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Custom collision detection
  const collisionDetectionStrategy = (args) => {
    const { active, droppableContainers } = args;
    const activeType = active?.data?.current?.type;

    if (activeType === "list") {
      return closestCorners({
        ...args,
        droppableContainers: droppableContainers.filter(
          (c) => c.data?.current?.type === "list"
        ),
      });
    }

    if (activeType === "card") {
      return closestCorners({
        ...args,
        droppableContainers: droppableContainers.filter(
          (c) => c.data?.current?.type !== "add-card"
        ),
      });
    }

    return closestCorners(args);
  };

  const listIds = useMemo(() => lists.map((l) => l.id), [lists]);

  // Helper functions
  const findCard = (cardId) => {
    for (const list of lists) {
      const idx = list.cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) return { listId: list.id, cardIndex: idx, card: list.cards[idx] };
    }
    return null;
  };

  const moveCard = (cardId, toListId, toIndex) => {
    setLists((prev) => {
      const draft = structuredClone(prev);
      const from = findCard(cardId);
      if (!from) return prev;
      const [moved] = draft
        .find((l) => l.id === from.listId)
        .cards.splice(from.cardIndex, 1);
      const targetList = draft.find((l) => l.id === toListId);
      targetList.cards.splice(toIndex, 0, moved);
      return draft;
    });
  };

  const reorderList = (fromId, toId) => {
    setLists((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === fromId);
      const newIndex = prev.findIndex((l) => l.id === toId);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // DnD event handlers
  function handleDragStart(event) {
    const { active } = event;
    const data = active.data?.current;
    
    if (data?.type === "card") {
      const found = findCard(active.id);
      setActiveCard(found?.card || null);
      setActiveList(null);
    } else if (data?.type === "list") {
      const list = lists.find((l) => l.id === active.id);
      setActiveList(list || null);
      setActiveCard(null);
    }
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    // Ignore if hovering over add-card button
    if (over.data?.current?.type === "add-card") return;

    // Card → Card movement
    if (activeData?.type === "card" && overData?.type === "card") {
      const from = findCard(active.id);
      const to = findCard(over.id);
      if (!from || !to) return;
      if (from.listId !== to.listId) {
        moveCard(active.id, to.listId, to.cardIndex);
      }
    }

    // Card → empty list or cards container
    if (activeData?.type === "card" && overData?.type === "cards") {
      const from = findCard(active.id);
      const toListId = overData.listId;
      if (from && toListId && from.listId !== toListId) {
        const toList = lists.find((l) => l.id === toListId);
        if (toList) {
          moveCard(active.id, toListId, toList.cards.length);
        }
      }
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);
    if (!over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (active.id === over.id) return;

    // Ignore if dropping on add-card button
    if (overData?.type === "add-card") return;

    // List reordering
    if (activeData?.type === "list" && overData?.type === "list") {
      reorderList(active.id, over.id);
      return;
    }

    // Card reordering within same list or moving to another card position
    if (activeData?.type === "card" && overData?.type === "card") {
      const from = findCard(active.id);
      const to = findCard(over.id);
      if (!from || !to) return;
      setLists((prev) => {
        const draft = structuredClone(prev);
        const sourceList = draft.find((l) => l.id === from.listId);
        if (!sourceList) return prev;
        const [moved] = sourceList.cards.splice(from.cardIndex, 1);
        const targetList = draft.find((l) => l.id === to.listId);
        if (!targetList) return prev;
        targetList.cards.splice(to.cardIndex, 0, moved);
        return draft;
      });
      return;
    }

    // Card dropped on empty list or cards container
    if (activeData?.type === "card" && overData?.type === "cards") {
      const from = findCard(active.id);
      const toListId = overData.listId;
      if (!from || !toListId) return;
      setLists((prev) => {
        const draft = structuredClone(prev);
        const sourceList = draft.find((l) => l.id === from.listId);
        if (!sourceList) return prev;
        const [moved] = sourceList.cards.splice(from.cardIndex, 1);
        const targetList = draft.find((l) => l.id === toListId);
        if (!targetList) return prev;
        targetList.cards.push(moved);
        return draft;
      });
    }
  }

  // ────────────────────────────── CRUD ──────────────────────────────
  const addList = () => {
    const title = newListTitle.trim();
    if (!title) return;
    setLists((prev) => [...prev, { id: `list-${Date.now()}`, title, cards: [] }]);
    setNewListTitle("");
    setIsAddingList(false);
  };

  const addCard = (listId, rawTitle) => {
    const title = rawTitle.trim();
    if (!title) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              cards: [
                ...l.cards,
                {
                  id: `card-${Date.now()}`,
                  title,
                  description: "",
                  assignedMemberIds: [],
                  dueDate: "",
                  isCompleted: false,
                  attachments: [],
                  milestones: [],
                },
              ],
            }
          : l
      )
    );
  };

  const updateCard = (listId, updatedCard) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            }
          : l
      )
    );
  };

  const deleteCard = (listId, cardId) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l))
    );
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-4 pb-6">
          <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <BoardList
                key={list.id}
                list={list}
                members={members}
                onAddCard={(title) => addCard(list.id, title)}
                onCardClick={(card) => setEditingCard({ listId: list.id, card })}
                onUpdateCard={updateCard}
              />
            ))}

            {/* Add List button */}
            <div className="min-w-[280px] flex-shrink-0">
              {isAddingList ? (
                <div className="bg-white/80 rounded-xl p-3 backdrop-blur border">
                  <input
                    autoFocus
                    className="w-full rounded-md border px-3 py-2 mb-2"
                    placeholder="List title"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addList();
                      } else if (e.key === "Escape") {
                        setIsAddingList(false);
                      }
                    }}
                    onBlur={() => {
                      if (!newListTitle.trim()) {
                        setIsAddingList(false);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={addList} 
                      className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add list
                    </button>
                    <button 
                      onClick={() => {
                        setIsAddingList(false);
                        setNewListTitle("");
                      }} 
                      className="px-3 py-1.5 rounded border hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-[280px] h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border bg-white/60 hover:bg-white transition-colors"
                >
                  <Plus size={18} /> Add another list
                </button>
              )}
            </div>
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && (
            <div className="w-[260px] p-3 rounded-lg bg-white shadow-2xl opacity-90 rotate-2">
              {activeCard.title}
            </div>
          )}
          {activeList && (
            <div className="w-[280px] rounded-xl bg-white/90 p-3 shadow-2xl opacity-90 rotate-1">
              <h3 className="font-semibold mb-2">{activeList.title}</h3>
              <div className="space-y-2">
                {activeList.cards.slice(0, 3).map((card) => (
                  <div key={card.id} className="bg-gray-100 rounded p-2 text-sm">
                    {card.title}
                  </div>
                ))}
                {activeList.cards.length > 3 && (
                  <div className="text-xs text-gray-500">+{activeList.cards.length - 3} more</div>
                )}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Edit Card Modal */}
      {editingCard && (
        <CardModal
          listId={editingCard.listId}
          card={editingCard.card}
          members={members}
          onClose={() => setEditingCard(null)}
          onUpdate={(listId, card) => updateCard(listId, card)}
          onDelete={(listId, cardId) => {
            deleteCard(listId, cardId);
            setEditingCard(null);
          }}
        />
      )}
    </>
  );
}
