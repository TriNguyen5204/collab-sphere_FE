import React, { useMemo, useState, forwardRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import BoardList from './BoardList';
import CardModal from './CardModal';
import UndoNotification from './UndoNotification';
import { useSignalRContext } from '../../../context/kanban/useSignalRContext';
import {
  createList,
  moveList,
  moveCard as moveCardSignalR,
  updateCardDetails,
  deleteCard as deleteCardSignalR,
} from '../../../hooks/kanban/signalRHelper';
import { getPositionForIndex } from '../../../utils/positionHelper';
import {
  sortListsAndCards,
  sortListsByPosition,
} from '../../../utils/sortHelper';
const TrelloBoard = forwardRef(function TrelloBoard(
  { onUpdateArchived, workspaceData },
  ref
) {
  const workspaceId = workspaceData?.id;
  const { connection, isConnected } = useSignalRContext();
  const [lists, setLists] = useState([]);
  const [archivedItems, setArchivedItems] = useState({ cards: [], lists: [] });
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [undoAction, setUndoAction] = useState(null);

  useEffect(() => {
    if (!workspaceData) return;

    // Convert workspaceData → lists đúng format TrelloBoard
    const convertedLists = workspaceData.lists.map(list => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: list.cards.map(card => ({
        id: card.id.toString(),
        title: card.title,
        description: card.description ?? '',
        riskLevel: card.riskLevel,
        dueAt: card.dueAt,
        createdAt: card.createdAt,
        position: card.position,
        isCompleted: card.isComplete,
        assignedMembers: card.assignedMembers.map(member => ({
          studentId: member.studentId,
          studentName: member.studentName,
          avatarImg: member.avatarImg,
        })),
        tasks: (card.tasks ?? []).map(task => ({
          taskId: task.taskId,
          taskTitle: task.taskTitle,
          isDone: task.isDone,
          subTaskDtos: (task.subTaskDtos ?? []).map(subtask => ({
            subTaskId: subtask.subTaskId,
            subTaskTitle: subtask.subTaskTitle,
            isDone: subtask.isDone,
          })),
        })),
      })),
    }));
    const sortedList = sortListsAndCards(convertedLists);

    setLists(sortedList);
  }, [workspaceData]);

  // Lắng nghe SignalR events
  useEffect(() => {
    if (!connection || !isConnected) return;

    // List Events
    connection.on('ReceiveListCreated', message => {
      try {
        const data = JSON.parse(message);
        setLists(prev => {
          const updated = [
            ...prev,
            {
              id: data.id,
              title: data.title,
              position: data.position,
              cards: [],
            },
          ];

          // Sort sau khi thêm
          return updated.sort((a, b) => a.position - b.position);
        });
      } catch (e) {
        console.error('Error parsing ListCreated:', e);
      }
    });

    connection.on('ReceiveListRenamed', (listId, newTitle) => {
      console.log('ReceiveListRenamed:', listId, newTitle);
      setLists(prev =>
        prev.map(l => (l.id === listId ? { ...l, title: newTitle } : l))
      );
    });

    connection.on('ReceiveListMoved', (listId, newPosition) => {
      console.log('ReceiveListMoved:', listId, newPosition);
      setLists(prev =>
        prev.map(l =>
          l.id === listId.toString() ? { ...l, position: newPosition } : l
        )
      );
    });

    // Card Events
    connection.on('ReceiveCardCreated', (listId, message) => {
      try {
        const cardData = JSON.parse(message);

        setLists(prev =>
          prev.map(l =>
            l.id === listId
              ? {
                  ...l,
                  cards: [
                    ...l.cards,
                    {
                      id: cardData.CardId,
                      title: cardData.Title,
                      description: cardData.Description ?? '',
                      riskLevel: cardData.RiskLevel,
                      dueAt: cardData.DueAt,
                      position: cardData.Position,
                      isCompleted: cardData.IsCompleted,
                      assignedMembers: (cardData.CardAssignments || []).map(
                        a => ({
                          studentId: a.StudentId,
                          studentName: a.StudentName,
                          avatarImg: a.Avatar,
                        })
                      ),
                      tasks: (cardData.Tasks || []).map(t => ({
                        taskId: t.TaskId,
                        taskTitle: t.TaskTitle,
                        isDone: t.IsDone ?? false,
                        subTaskDtos: (t.SubTasks || []).map(st => ({
                          subTaskId: st.SubTaskId,
                          subTaskTitle: st.SubTaskTitle,
                          isDone: st.IsDone ?? false,
                        })),
                      })),
                    },
                  ]
                    // ✅ Sort cards sau khi thêm
                    .sort((a, b) => a.position - b.position),
                }
              : l
          )
        );
      } catch (e) {
        console.error('Error parsing CardCreated:', e);
      }
    });

    connection.on('ReceiveCardMoved', (cardId, newListId, newPosition) => {
      setLists(prev => {
        const draft = structuredClone(prev);

        // Tìm và di chuyển card
        let movedCard = null;
        for (const list of draft) {
          const cardIndex = list.cards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            [movedCard] = list.cards.splice(cardIndex, 1);
            break;
          }
        }

        if (!movedCard) return prev;

        const targetList = draft.find(l => l.id === newListId);
        if (!targetList) return prev;

        movedCard.position = newPosition;
        targetList.cards.push(movedCard);

        // ✅ Sort cards trong list đích
        targetList.cards.sort((a, b) => a.position - b.position);

        return draft;
      });
    });

    connection.on('ReceiveCardUpdated', (cardId, message) => {
      console.log('ReceiveCardUpdated:', cardId);
      try {
        const updates = JSON.parse(message);
        setLists(prev =>
          prev.map(l => ({
            ...l,
            cards: l.cards.map(c =>
              c.id === cardId.toString()
                ? {
                    ...c,
                    title: updates.CardTitle,
                    description: updates.CardDescription,
                    riskLevel: updates.RiskLevel,
                    dueAt: updates.DueAt,
                  }
                : c
            ),
          }))
        );
      } catch (e) {
        console.error('Error parsing ReceiveCardUpdated:', e);
      }
    });

    connection.on('ReceiveCardComplete', (listId, cardId, isComplete) => {
      console.log('ReceiveCardComplete:', { listId, cardId, isComplete });
      setLists(prev =>
        prev.map(l =>
          l.id === listId.toString()
            ? {
                ...l,
                cards: l.cards.map(c =>
                  c.id === cardId.toString()
                    ? { ...c, isCompleted: isComplete }
                    : c
                ),
              }
            : l
        )
      );
    });

    connection.on('ReceiveCardAssigned', (listId, cardId, message) => {
      console.log('ReceiveCardAssigned:', { listId, cardId });
      try {
        const memberData = JSON.parse(message);
        setLists(prev =>
          prev.map(l =>
            l.id === listId.toString()
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    c.id === cardId.toString()
                      ? {
                          ...c,
                          assignedMembers: [
                            ...(c.assignedMembers || []),
                            {
                              studentId: memberData.studentId,
                              studentName: memberData.studentName,
                              avatarImg: memberData.avatarImg,
                            },
                          ],
                        }
                      : c
                  ),
                }
              : l
          )
        );
      } catch (e) {
        console.error('Error parsing ReceiveCardAssigned:', e);
      }
    });

    connection.on('ReceiveCardUnAssigned', (listId, cardId, studentId) => {
      console.log('ReceiveCardUnAssigned:', { listId, cardId, studentId });
      setLists(prev =>
        prev.map(l =>
          l.id === listId.toString()
            ? {
                ...l,
                cards: l.cards.map(c =>
                  c.id === cardId.toString()
                    ? {
                        ...c,
                        assignedMembers: (c.assignedMembers || []).filter(
                          m => m.studentId !== studentId
                        ),
                      }
                    : c
                ),
              }
            : l
        )
      );
    });

    // Task Events
    connection.on('ReceiveTaskCreated', (listId, cardId, message) => {
      console.log('ReceiveTaskCreated:', { listId, cardId });
      try {
        const taskData = JSON.parse(message);
        setLists(prev =>
          prev.map(l =>
            l.id === listId.toString()
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    c.id === cardId.toString()
                      ? {
                          ...c,
                          tasks: [
                            ...(c.tasks || []),
                            {
                              taskId: taskData.taskId,
                              taskTitle: taskData.taskTitle,
                              isDone: taskData.isDone || false,
                              subTaskDtos: taskData.subTaskDtos || [],
                            },
                          ],
                        }
                      : c
                  ),
                }
              : l
          )
        );
      } catch (e) {
        console.error('Error parsing ReceiveTaskCreated:', e);
      }
    });

    connection.on('ReceiveTaskRenamed', (listId, cardId, taskId, newTitle) => {
      console.log('ReceiveTaskRenamed:', { listId, cardId, taskId, newTitle });
      setLists(prev =>
        prev.map(l =>
          l.id === listId.toString()
            ? {
                ...l,
                cards: l.cards.map(c =>
                  c.id === cardId.toString()
                    ? {
                        ...c,
                        tasks: (c.tasks || []).map(t =>
                          t.taskId === taskId
                            ? { ...t, taskTitle: newTitle }
                            : t
                        ),
                      }
                    : c
                ),
              }
            : l
        )
      );
    });

    connection.on('ReceiveTaskDeleted', (listId, cardId, taskId) => {
      console.log('ReceiveTaskDeleted:', { listId, cardId, taskId });
      setLists(prev =>
        prev.map(l =>
          l.id === listId.toString()
            ? {
                ...l,
                cards: l.cards.map(c =>
                  c.id === cardId.toString()
                    ? {
                        ...c,
                        tasks: (c.tasks || []).filter(t => t.taskId !== taskId),
                      }
                    : c
                ),
              }
            : l
        )
      );
    });

    // SubTask Events
    connection.on(
      'ReceiveSubTaskCreated',
      (listId, cardId, taskId, message) => {
        console.log('ReceiveSubTaskCreated:', { listId, cardId, taskId });
        try {
          const subTaskData = JSON.parse(message);
          setLists(prev =>
            prev.map(l =>
              l.id === listId.toString()
                ? {
                    ...l,
                    cards: l.cards.map(c =>
                      c.id === cardId.toString()
                        ? {
                            ...c,
                            tasks: (c.tasks || []).map(t =>
                              t.taskId === taskId
                                ? {
                                    ...t,
                                    subTaskDtos: [
                                      ...(t.subTaskDtos || []),
                                      {
                                        subTaskId: subTaskData.subTaskId,
                                        subTaskTitle: subTaskData.subTaskTitle,
                                        isDone: subTaskData.isDone || false,
                                      },
                                    ],
                                  }
                                : t
                            ),
                          }
                        : c
                    ),
                  }
                : l
            )
          );
        } catch (e) {
          console.error('Error parsing ReceiveSubTaskCreated:', e);
        }
      }
    );

    connection.on(
      'ReceiveSubTaskRenamed',
      (listId, cardId, taskId, subTaskId, newTitle) => {
        console.log('ReceiveSubTaskRenamed:', {
          listId,
          cardId,
          taskId,
          subTaskId,
          newTitle,
        });
        setLists(prev =>
          prev.map(l =>
            l.id === listId.toString()
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    c.id === cardId.toString()
                      ? {
                          ...c,
                          tasks: (c.tasks || []).map(t =>
                            t.taskId === taskId
                              ? {
                                  ...t,
                                  subTaskDtos: (t.subTaskDtos || []).map(s =>
                                    s.subTaskId === subTaskId
                                      ? { ...s, subTaskTitle: newTitle }
                                      : s
                                  ),
                                }
                              : t
                          ),
                        }
                      : c
                  ),
                }
              : l
          )
        );
      }
    );

    connection.on(
      'ReceiveSubTaskDeleted',
      (listId, cardId, taskId, subTaskId) => {
        console.log('ReceiveSubTaskDeleted:', {
          listId,
          cardId,
          taskId,
          subTaskId,
        });
        setLists(prev =>
          prev.map(l =>
            l.id === listId.toString()
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    c.id === cardId.toString()
                      ? {
                          ...c,
                          tasks: (c.tasks || []).map(t =>
                            t.taskId === taskId
                              ? {
                                  ...t,
                                  subTaskDtos: (t.subTaskDtos || []).filter(
                                    s => s.subTaskId !== subTaskId
                                  ),
                                }
                              : t
                          ),
                        }
                      : c
                  ),
                }
              : l
          )
        );
      }
    );

    connection.on(
      'ReceiveSubTaskMarkDone',
      (listId, cardId, taskId, subTaskId, isDone) => {
        console.log('ReceiveSubTaskMarkDone:', {
          listId,
          cardId,
          taskId,
          subTaskId,
          isDone,
        });
        setLists(prev =>
          prev.map(l =>
            l.id === listId.toString()
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    c.id === cardId.toString()
                      ? {
                          ...c,
                          tasks: (c.tasks || []).map(t =>
                            t.taskId === taskId
                              ? {
                                  ...t,
                                  subTaskDtos: (t.subTaskDtos || []).map(s =>
                                    s.subTaskId === subTaskId
                                      ? { ...s, isDone: isDone }
                                      : s
                                  ),
                                }
                              : t
                          ),
                        }
                      : c
                  ),
                }
              : l
          )
        );
      }
    );

    // Cleanup
    return () => {
      connection.off('ReceiveListCreated');
      connection.off('ReceiveListRenamed');
      connection.off('ReceiveListMoved');
      connection.off('ReceiveCardCreated');
      connection.off('ReceiveCardMoved');
      connection.off('ReceiveCardUpdated');
      connection.off('ReceiveCardComplete');
      connection.off('ReceiveCardDeleted');
      connection.off('ReceiveCardAssigned');
      connection.off('ReceiveCardUnAssigned');
      connection.off('ReceiveTaskCreated');
      connection.off('ReceiveTaskRenamed');
      connection.off('ReceiveTaskDeleted');
      connection.off('ReceiveSubTaskCreated');
      connection.off('ReceiveSubTaskRenamed');
      connection.off('ReceiveSubTaskDeleted');
      connection.off('ReceiveSubTaskMarkDone');
    };
  }, [connection, isConnected]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (onUpdateArchived) {
      onUpdateArchived(archivedItems);
    }
  }, [archivedItems, onUpdateArchived]);

  // Custom collision detection
  const collisionDetectionStrategy = args => {
    const { active, droppableContainers } = args;
    const activeType = active?.data?.current?.type;

    if (activeType === 'list') {
      return closestCorners({
        ...args,
        droppableContainers: droppableContainers.filter(
          c => c.data?.current?.type === 'list'
        ),
      });
    }

    if (activeType === 'card') {
      return closestCorners({
        ...args,
        droppableContainers: droppableContainers.filter(
          c => c.data?.current?.type !== 'add-card'
        ),
      });
    }

    return closestCorners(args);
  };

  const orderedLists = useMemo(() => sortListsByPosition(lists), [lists]);
  const listIds = useMemo(() => orderedLists.map(l => l.id), [orderedLists]);
  console.log('Rendering TrelloBoard with lists:', orderedLists);

  // Helper functions
  const findCard = cardId => {
    for (const list of lists) {
      const idx = list.cards.findIndex(c => c.id === cardId);
      if (idx !== -1)
        return { listId: list.id, cardIndex: idx, card: list.cards[idx] };
    }
    return null;
  };

  const moveCard = (cardId, toListId, toIndex) => {
    setLists(prev => {
      const draft = structuredClone(prev);
      const from = findCard(cardId);
      if (!from) return prev;
      const [moved] = draft
        .find(l => l.id === from.listId)
        .cards.splice(from.cardIndex, 1);
      const targetList = draft.find(l => l.id === toListId);
      targetList.cards.splice(toIndex, 0, moved);
      return draft;
    });
  };

  // DnD event handlers
  function handleDragStart(event) {
    const { active } = event;
    const data = active.data?.current;

    if (data?.type === 'card') {
      const found = findCard(active.id);
      setActiveCard(found?.card || null);
      setActiveList(null);
    } else if (data?.type === 'list') {
      const list = lists.find(l => l.id === active.id);
      setActiveList(list || null);
      setActiveCard(null);
    }
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (over.data?.current?.type === 'add-card') return;

    if (activeData?.type === 'card' && overData?.type === 'card') {
      const from = findCard(active.id);
      const to = findCard(over.id);
      if (!from || !to) return;
      if (from.listId !== to.listId) {
        moveCard(active.id, to.listId, to.cardIndex);
      }
    }

    if (activeData?.type === 'card' && overData?.type === 'cards') {
      const from = findCard(active.id);
      const toListId = overData.listId;
      if (from && toListId && from.listId !== toListId) {
        const toList = lists.find(l => l.id === toListId);
        if (toList) {
          moveCard(active.id, toListId, toList.cards.length);
        }
      }
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);
    if (!over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (active.id === over.id) return;

    if (overData?.type === 'add-card') return;

    if (activeData?.type === 'list' && overData?.type === 'list') {
      const fromIndex = orderedLists.findIndex(l => l.id === active.id);
      const toIndex = orderedLists.findIndex(l => l.id === over.id);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        // Tạo mảng tạm KHÔNG bao gồm list đang kéo
        const tempLists = orderedLists
          .filter((_, idx) => idx !== fromIndex)
          .sort((a, b) => a.position - b.position);

        // Điều chỉnh toIndex
        const adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;

        // ✨ SỬ DỤNG HELPER FUNCTION
        const newPosition = getPositionForIndex(tempLists, adjustedToIndex);

        console.log('📊 Moving list:', {
          listId: active.id,
          fromIndex,
          toIndex,
          adjustedToIndex,
          newPosition,
        });

        // Update UI optimistically
        setLists(() => {
          const updated = [...orderedLists];
          const [movedList] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, { ...movedList, position: newPosition });
          return updated;
        });

        // Gọi SignalR
        try {
          const payload =
            (connection, workspaceData.id, parseInt(active.id), newPosition);
          console.log('Invoking moveList via SignalR', payload);
          await moveList(connection, workspaceData.id, active.id, newPosition);
        } catch (error) {
          console.error('Error moving list:', error);
          setLists(lists); // Rollback
        }
      }
      return;
    }

    // xử lý di chuyển card
    if (activeData?.type === 'card' && overData?.type === 'card') {
      const from = findCard(active.id);
      const to = findCard(over.id);
      if (!from || !to) return;

      // Nếu drop vào chính nó, bỏ qua
      if (from.listId === to.listId && from.cardIndex === to.cardIndex) {
        return;
      }

      const targetList = lists.find(l => l.id === to.listId);
      if (!targetList) return;

      // Tạo mảng cards tạm KHÔNG bao gồm card đang kéo
      let tempCards =
        from.listId === to.listId
          ? targetList.cards.filter(c => c.id !== active.id)
          : [...targetList.cards];

      // Sắp xếp theo position
      tempCards.sort((a, b) => a.position - b.position);

      // Điều chỉnh targetIndex nếu cùng list và kéo xuống
      let targetIndex = to.cardIndex;
      if (from.listId === to.listId && from.cardIndex < to.cardIndex) {
        targetIndex = to.cardIndex - 1;
      }

      // ✨ SỬ DỤNG HELPER FUNCTION
      const newPosition = getPositionForIndex(tempCards, targetIndex);

      console.log('🎯 Moving card:', {
        cardId: active.id,
        fromList: from.listId,
        toList: to.listId,
        fromIndex: from.cardIndex,
        toIndex: to.cardIndex,
        adjustedIndex: targetIndex,
        newPosition,
        tempCardsCount: tempCards.length,
      });

      // Update UI optimistically
      setLists(prev => {
        const draft = structuredClone(prev);

        const sourceList = draft.find(l => l.id === from.listId);
        if (!sourceList) return prev;
        const [movedCard] = sourceList.cards.splice(from.cardIndex, 1);

        const destList = draft.find(l => l.id === to.listId);
        if (!destList) return prev;

        movedCard.position = newPosition;
        destList.cards.splice(to.cardIndex, 0, movedCard);

        return draft;
      });

      // Gọi SignalR
      try {
        await moveCardSignalR(
          connection,
          workspaceData.id,
          parseInt(from.listId),
          parseInt(active.id),
          parseInt(to.listId),
          newPosition
        );
      } catch (error) {
        console.error('Error moving card:', error);
        setLists(lists);
      }
      return;
    }

    if (activeData?.type === 'card' && overData?.type === 'cards') {
      const from = findCard(active.id);
      const toListId = overData.listId;
      const targetList = lists.find(l => l.id === toListId);
      if (!targetList) return;

      // Lọc bỏ card đang kéo nếu cùng list
      const existingCards = targetList.cards
        .filter(c => c.id !== active.id)
        .sort((a, b) => a.position - b.position);

      // Tính position: thêm vào cuối list
      const newPosition = getPositionForIndex(
        existingCards,
        existingCards.length
      );

      console.log('📥 Dropping card to list area:', {
        cardId: active.id,
        fromList: from.listId,
        toList: toListId,
        existingCardsCount: existingCards.length,
        newPosition,
      });

      // Update UI optimistically
      setLists(prev => {
        const draft = structuredClone(prev);

        const sourceList = draft.find(l => l.id === from.listId);
        if (!sourceList) return prev;
        const [movedCard] = sourceList.cards.splice(from.cardIndex, 1);

        const destList = draft.find(l => l.id === toListId);
        if (!destList) return prev;

        movedCard.position = newPosition;
        destList.cards.push(movedCard);

        return draft;
      });

      // Gọi SignalR
      try {
        await moveCardSignalR(
          connection,
          workspaceData.id,
          parseInt(from.listId),
          parseInt(active.id),
          parseInt(toListId),
          newPosition
        );
      } catch (error) {
        console.error('Error moving card:', error);
        setLists(lists);
      }
    }
  }

  // CRUD operations with SignalR
  const addList = async () => {
    const title = newListTitle.trim();
    if (!title) return;

    try {
      // Sắp xếp lists theo position
      const sortedLists = [...lists].sort((a, b) => a.position - b.position);

      // ✨ SỬ DỤNG HELPER - Thêm vào cuối
      const newPosition = getPositionForIndex(sortedLists, sortedLists.length);

      console.log('➕ Creating new list:', {
        title,
        currentListsCount: lists.length,
        newPosition,
        workspaceId: workspaceData.id,
      });

      await createList(connection, workspaceData.id, title, newPosition);

      setNewListTitle('');
      setIsAddingList(false);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    }
  };

  const updateCard = async (listId, updatedCard) => {
    // Update UI optimistically
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? {
              ...l,
              cards: l.cards.map(c =>
                c.id === updatedCard.id ? updatedCard : c
              ),
            }
          : l
      )
    );
    // Gọi SignalR
    try {
      await updateCardDetails(
        connection,
        workspaceData.id,
        parseInt(listId),
        parseInt(updatedCard.id),
        {
          title: updatedCard.title,
          description: updatedCard.description,
          riskLevel: updatedCard.riskLevel,
          dueAt: updatedCard.dueAt,
        }
      );
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const addCard = (listId, title) => {
    const safeTitle = (title ?? '').toString().trim();
    if (!safeTitle) return;
    setLists(prev =>
      prev.map(l => {
        if (l.id !== listId) return l;
        const newCard = {
          id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: safeTitle,
          description: '',
          isCompleted: false,
          archived: false,
          createdAt: new Date().toISOString(),
          assignedMembers: [],
          attachments: [],
          labels: [],
          riskLevel: 'low',
          tasks: [],
        };
        return { ...l, cards: [...l.cards, newCard] };
      })
    );
  };

  const archiveCard = (listId, cardId) => {
    const from = findCard(cardId);
    if (!from) return;
    const archivedCard = {
      ...from.card,
      listId,
      archivedAt: new Date().toISOString(),
    };

    setArchivedItems(prev => ({
      ...prev,
      cards: [...prev.cards, archivedCard],
    }));

    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? { ...l, cards: l.cards.filter(c => c.id !== cardId) }
          : l
      )
    );

    setUndoAction({
      type: 'card',
      item: archivedCard,
      listId,
      message: `Card "${archivedCard.title}" archived`,
    });
  };

  const deleteCard = async (listId, cardId) => {
    try {
      await deleteCardSignalR(
        connection,
        workspaceData.id,
        parseInt(listId),
        parseInt(cardId)
      );
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const archiveList = listId => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const archivedList = { ...list, archivedAt: new Date().toISOString() };

    setArchivedItems(prev => ({
      ...prev,
      lists: [...prev.lists, archivedList],
    }));

    setLists(prev => prev.filter(l => l.id !== listId));

    setUndoAction({
      type: 'list',
      item: archivedList,
      message: `List "${archivedList.title}" archived`,
    });
  };

  const restoreCard = (cardId, listId) => {
    const archivedCard = archivedItems.cards.find(c => c.id === cardId);
    if (!archivedCard) return;

    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? {
              ...l,
              cards: [...l.cards, { ...archivedCard, archivedAt: undefined }],
            }
          : l
      )
    );

    setArchivedItems(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId),
    }));
  };

  const restoreList = listId => {
    const archivedList = archivedItems.lists.find(l => l.id === listId);
    if (!archivedList) return;

    setLists(prev => [...prev, { ...archivedList, archivedAt: undefined }]);

    setArchivedItems(prev => ({
      ...prev,
      lists: prev.lists.filter(l => l.id !== listId),
    }));
  };

  const handleUndo = () => {
    if (!undoAction) return;

    if (undoAction.type === 'card') {
      restoreCard(undoAction.item.id, undoAction.listId);
    } else if (undoAction.type === 'list') {
      restoreList(undoAction.item.id);
    }

    setUndoAction(null);
  };

  return (
    <>
      {/* ✅ Connection Status */}
      {!isConnected && (
        <div className='mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded'>
          <p className='font-semibold'> Disconnected from server</p>
          <p className='text-sm'>Reconnecting...</p>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div ref={ref} className='flex items-start gap-4 pb-6'>
          <SortableContext
            items={listIds}
            strategy={horizontalListSortingStrategy}
          >
            {orderedLists.map(list => (
              <BoardList
                key={list.id}
                list={list}
                members={list.cards.flatMap(card => card.assignedMembers || [])}
                onAddCard={(listId, cardTitle) => addCard(listId, cardTitle)}
                onCardClick={card =>
                  setEditingCard({
                    listId: list.id,
                    listTitle: list.title,
                    card,
                  })
                }
                onUpdateCard={updateCard}
                onArchiveList={() => archiveList(list.id)}
                workspaceId={workspaceId}
              />
            ))}

            {/* Add List button */}
            <div className='min-w-[280px] flex-shrink-0'>
              {isAddingList ? (
                <div className='bg-white/80 rounded-xl p-3 backdrop-blur border'>
                  <input
                    autoFocus
                    className='w-full rounded-md border px-3 py-2 mb-2'
                    placeholder='List title'
                    value={newListTitle}
                    onChange={e => setNewListTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addList();
                      } else if (e.key === 'Escape') {
                        setIsAddingList(false);
                      }
                    }}
                    onBlur={() => {
                      if (!newListTitle.trim()) {
                        setIsAddingList(false);
                      }
                    }}
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={addList}
                      className='px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700'
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingList(false);
                        setNewListTitle('');
                      }}
                      className='px-3 py-1.5 rounded border hover:bg-gray-100'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className='w-[280px] h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border bg-white/60 hover:bg-white transition-colors'
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
            <div className='w-[260px] p-3 rounded-lg bg-white shadow-2xl opacity-90 rotate-2'>
              {activeCard.title}
            </div>
          )}
          {activeList && (
            <div className='w-[280px] rounded-xl bg-white/90 p-3 shadow-2xl opacity-90 rotate-1'>
              <h3 className='font-semibold mb-2'>{activeList.title}</h3>
              <div className='space-y-2'>
                {activeList.cards.slice(0, 3).map(card => (
                  <div
                    key={card.id}
                    className='bg-gray-100 rounded p-2 text-sm'
                  >
                    {card.title}
                  </div>
                ))}
                {activeList.cards.length > 3 && (
                  <div className='text-xs text-gray-500'>
                    +{activeList.cards.length - 3} more
                  </div>
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
          listTitle={editingCard.listTitle}
          card={editingCard.card}
          members={workspaceData.members}
          workspaceId={workspaceData?.id}
          onClose={() => setEditingCard(null)}
          onUpdate={(listId, card) => updateCard(listId, card)}
          onDelete={(listId, cardId) => {
            deleteCard(listId, cardId);
            setEditingCard(null);
          }}
          onArchive={(listId, cardId) => {
            archiveCard(listId, cardId);
            setEditingCard(null);
          }}
        />
      )}

      {/* Undo Notification */}
      {undoAction && (
        <UndoNotification
          message={undoAction.message}
          onUndo={handleUndo}
          onClose={() => setUndoAction(null)}
        />
      )}
    </>
  );
});

export default TrelloBoard;
