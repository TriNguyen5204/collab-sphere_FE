import React, { useMemo, useState, forwardRef, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
import { useSignalRContext } from '../../../../context/kanban/useSignalRContext';
import {
  createList,
  moveList,
  moveCard as moveCardSignalR,
  updateCardDetails,
  deleteCard as deleteCardSignalR,
} from '../../../../hooks/kanban/signalRHelper';
import { getPositionForIndex } from '../../../../utils/positionHelper';
import {
  sortListsAndCards,
  sortListsByPosition,
} from '../../../../utils/sortHelper';

const TrelloBoard = forwardRef(function TrelloBoard(
  { workspaceData, members },
  ref
) {
  const workspaceId = workspaceData?.id;
  const { connection, isConnected } = useSignalRContext();

  const [lists, setLists] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // ✅ Ref to store snapshot before drag
  const dragSnapshotRef = useRef(null);
  // ref to track if initialized
  const isInitializedRef = useRef(false);

  // Initialize lists from workspace data
  useEffect(() => {
    if (!workspaceData) return;
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    const convertedLists = workspaceData.lists.map(list => ({
      id: String(list.id), // ✅ Ensure it is string
      title: list.title,
      position: list.position,
      cards: list.cards.map(card => ({
        id: String(card.id), // ✅ Ensure it is string
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

    setLists(sortListsAndCards(convertedLists));
  }, [workspaceData]);

  console.log('Lists: ', lists);

  // SignalR event listeners
  useEffect(() => {
    if (!connection || !isConnected) return;

    // ===================== LIST EVENTS =====================

    connection.on('ReceiveListCreated', message => {
      console.log('📋 ReceiveListCreated:', message);
      try {
        const data = JSON.parse(message);
        console.log('data', data);
        setLists(prev => {
          const updated = [
            ...prev,
            {
              id: String(data.ListId), // ✅ Ensure it is string
              title: data.Title,
              position: data.Position,
              cards: [],
            },
          ];
          return updated.sort((a, b) => a.position - b.position);
        });
      } catch (e) {
        console.error('Error parsing ListCreated:', e);
      }
    });

    connection.on('ReceiveListRenamed', (listId, newTitle) => {
      console.log('📝 ReceiveListRenamed:', { listId, newTitle });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId) ? { ...l, title: newTitle } : l
        )
      );
    });

    connection.on('ReceiveListMoved', (listId, newPosition) => {
      console.log('🚀 ReceiveListMoved:', { listId, newPosition });

      setLists(prev => {
        const updated = prev.map(l =>
          String(l.id) === String(listId) ? { ...l, position: newPosition } : l
        );
        return updated.sort((a, b) => a.position - b.position);
      });

      console.log('✅ List moved successfully via SignalR');
    });

    // ===================== CARD EVENTS =====================

    connection.on('ReceiveCardCreated', (listId, message) => {
      console.log('📋 ReceiveCardCreated:', { listId });
      try {
        const cardData = JSON.parse(message);
        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: [
                    ...l.cards,
                    {
                      id: String(cardData.CardId), // ✅ Ensure it is string
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
                  ].sort((a, b) => a.position - b.position),
                }
              : l
          )
        );
      } catch (e) {
        console.error('Error parsing CardCreated:', e);
      }
    });

    connection.on('ReceiveCardMoved', (cardId, newListId, newPosition) => {
      console.log('🚀 ReceiveCardMoved:', { cardId, newListId, newPosition });

      setLists(prev => {
        const draft = structuredClone(prev);

        let movedCard = null;
        for (const list of draft) {
          const cardIndex = list.cards.findIndex(
            c => String(c.id) === String(cardId)
          );
          if (cardIndex !== -1) {
            [movedCard] = list.cards.splice(cardIndex, 1);
            break;
          }
        }

        if (!movedCard) {
          console.warn('❌ Card not found:', cardId);
          return prev;
        }

        const targetList = draft.find(l => String(l.id) === String(newListId));
        if (!targetList) {
          console.warn('❌ Target list not found:', newListId);
          return prev;
        }

        movedCard.position = newPosition;
        targetList.cards.push(movedCard);
        targetList.cards.sort((a, b) => a.position - b.position);

        console.log('✅ Card moved successfully via SignalR');
        return draft;
      });
    });

    connection.on('ReceiveCardUpdated', (cardId, message) => {
      console.log('📝 ReceiveCardUpdated:', cardId);

      try {
        const updates = JSON.parse(message);
        console.log('📝 ReceiveCardUpdated PARSED:', updates);
        setLists(prev =>
          prev.map(l => ({
            ...l,
            cards: l.cards.map(c =>
              String(c.id) === String(cardId)
                ? {
                    ...c,
                    title: updates.Title,
                    description: updates.Description,
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
      console.log('✅ ReceiveCardComplete:', { listId, cardId, isComplete });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId)
            ? {
                ...l,
                cards: l.cards.map(c =>
                  String(c.id) === String(cardId)
                    ? { ...c, isCompleted: isComplete }
                    : c
                ),
              }
            : l
        )
      );
    });

    connection.on('ReceiveCardDeleted', (listId, cardId) => {
      console.log('🗑️ ReceiveCardDeleted:', { listId, cardId });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId)
            ? {
                ...l,
                cards: l.cards.filter(c => String(c.id) !== String(cardId)),
              }
            : l
        )
      );
    });

    connection.on('ReceiveCardAssigned', (listId, cardId, message) => {
      console.log('👤 ReceiveCardAssigned:', { listId, cardId });
      try {
        const memberData = JSON.parse(message);
        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    String(c.id) === String(cardId)
                      ? {
                          ...c,
                          assignedMembers: [
                            ...(c.assignedMembers || []),
                            {
                              studentId:
                                memberData.studentId || memberData.StudentId,
                              studentName:
                                memberData.studentName ||
                                memberData.StudentName,
                              avatarImg:
                                memberData.Avatar,
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
      console.log('👤 ReceiveCardUnAssigned:', { listId, cardId, studentId });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId)
            ? {
                ...l,
                cards: l.cards.map(c =>
                  String(c.id) === String(cardId)
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

    // ===================== TASK EVENTS =====================

    connection.on('ReceiveTaskCreated', (listId, cardId, message) => {
      console.log('📋 ReceiveTaskCreated:', { listId, cardId });
      try {
        const taskData = JSON.parse(message);
        console.log('✅ Parsed task data:', taskData);

        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    String(c.id) === String(cardId)
                      ? {
                          ...c,
                          tasks: [
                            ...(c.tasks || []),
                            {
                              taskId: taskData.TaskId || taskData.taskId,
                              taskTitle:
                                taskData.TaskTitle || taskData.taskTitle,
                              isDone:
                                taskData.IsDone || taskData.isDone || false,
                              subTaskDtos: (
                                taskData.SubTasks ||
                                taskData.subTaskDtos ||
                                []
                              ).map(st => ({
                                subTaskId: st.SubTaskId || st.subTaskId,
                                subTaskTitle:
                                  st.SubTaskTitle || st.subTaskTitle,
                                isDone: st.IsDone || st.isDone || false,
                              })),
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
      console.log('📝 ReceiveTaskRenamed:', {
        listId,
        cardId,
        taskId,
        newTitle,
      });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId)
            ? {
                ...l,
                cards: l.cards.map(c =>
                  String(c.id) === String(cardId)
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
      console.log('🗑️ ReceiveTaskDeleted:', { listId, cardId, taskId });
      setLists(prev =>
        prev.map(l =>
          String(l.id) === String(listId)
            ? {
                ...l,
                cards: l.cards.map(c =>
                  String(c.id) === String(cardId)
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

    // ===================== SUBTASK EVENTS =====================

    connection.on(
      'ReceiveSubTaskCreated',
      (listId, cardId, taskId, message) => {
        console.log('📋 ReceiveSubTaskCreated:', { listId, cardId, taskId });
        try {
          const subTaskData = JSON.parse(message);
          setLists(prev =>
            prev.map(l =>
              String(l.id) === String(listId)
                ? {
                    ...l,
                    cards: l.cards.map(c =>
                      String(c.id) === String(cardId)
                        ? {
                            ...c,
                            tasks: (c.tasks || []).map(t =>
                              t.taskId === taskId
                                ? {
                                    ...t,
                                    subTaskDtos: [
                                      ...(t.subTaskDtos || []),
                                      {
                                        subTaskId:
                                          subTaskData.SubTaskId ||
                                          subTaskData.subTaskId,
                                        subTaskTitle:
                                          subTaskData.SubTaskTitle ||
                                          subTaskData.subTaskTitle,
                                        isDone:
                                          subTaskData.IsDone ||
                                          subTaskData.isDone ||
                                          false,
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
        console.log('📝 ReceiveSubTaskRenamed:', {
          listId,
          cardId,
          taskId,
          subTaskId,
          newTitle,
          // Debug types
          listIdType: typeof listId,
          taskIdType: typeof taskId,
          subTaskIdType: typeof subTaskId,
        });
        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    String(c.id) === String(cardId)
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
        console.log('🗑️ ReceiveSubTaskDeleted:', {
          listId,
          cardId,
          taskId,
          subTaskId,
        });
        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    String(c.id) === String(cardId)
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
        console.log('✅ ReceiveSubTaskMarkDone:', {
          listId,
          cardId,
          taskId,
          subTaskId,
          isDone,
        });
        setLists(prev =>
          prev.map(l =>
            String(l.id) === String(listId)
              ? {
                  ...l,
                  cards: l.cards.map(c =>
                    String(c.id) === String(cardId)
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

  // ✅ Helper function with String comparison
  const findCard = cardId => {
    console.log('🔍 findCard called with:', cardId, 'type:', typeof cardId);

    for (const list of lists) {
      const idx = list.cards.findIndex(c => String(c.id) === String(cardId));
      if (idx !== -1) {
        console.log('✅ Found card in list:', list.id);
        return { listId: list.id, cardIndex: idx, card: list.cards[idx] };
      }
    }

    console.log('❌ Card not found!');
    return null;
  };

  // ===================== DnD EVENT HANDLERS =====================

  function handleDragStart(event) {
    const { active } = event;
    const data = active.data?.current;

    console.log('🟢 handleDragStart:', {
      activeId: active.id,
      activeIdType: typeof active.id,
      dataType: data?.type,
    });

    // ✅ Save snapshot before drag to rollback if needed
    dragSnapshotRef.current = structuredClone(lists);

    if (data?.type === 'card') {
      const found = findCard(active.id);
      console.log('🔍 findCard result:', found);
      setActiveCard(found?.card || null);
      setActiveList(null);
    } else if (data?.type === 'list') {
      // ✅ FIX: Compare string
      const list = lists.find(l => String(l.id) === String(active.id));
      setActiveList(list || null);
      setActiveCard(null);
    }
  }

  function handleDragOver(event) {
    const { active, over } = event;

    console.log('🟡 handleDragOver:', {
      activeId: active?.id,
      overId: over?.id,
      overType: over?.data?.current?.type,
    });

    if (!over) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (overData?.type === 'add-card') return;

    // ✅ Optimistic UI update ONLY for card (for smoother UX)
    if (activeData?.type === 'card' && overData?.type === 'card') {
      const from = findCard(active.id);
      const to = findCard(over.id);
      if (!from || !to) return;

      // ✅ FIX: Compare string
      if (String(from.listId) !== String(to.listId)) {
        setLists(prev => {
          const draft = structuredClone(prev);

          // ✅ FIX: Compare string
          const sourceList = draft.find(
            l => String(l.id) === String(from.listId)
          );
          const targetList = draft.find(
            l => String(l.id) === String(to.listId)
          );

          if (!sourceList || !targetList) return prev;

          const [moved] = sourceList.cards.splice(from.cardIndex, 1);
          targetList.cards.splice(to.cardIndex, 0, moved);

          return draft;
        });
      }
    }

    if (activeData?.type === 'card' && overData?.type === 'cards') {
      const from = findCard(active.id);
      const toListId = overData.listId;

      // ✅ FIX: Compare string
      if (from && toListId && String(from.listId) !== String(toListId)) {
        const toList = lists.find(l => String(l.id) === String(toListId));
        if (toList) {
          setLists(prev => {
            const draft = structuredClone(prev);

            // ✅ FIX: Compare string
            const sourceList = draft.find(
              l => String(l.id) === String(from.listId)
            );
            const targetList = draft.find(
              l => String(l.id) === String(toListId)
            );

            if (!sourceList || !targetList) return prev;

            const [moved] = sourceList.cards.splice(from.cardIndex, 1);
            targetList.cards.push(moved);

            return draft;
          });
        }
      }
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    console.log('🔴 handleDragEnd:', {
      activeId: active?.id,
      overId: over?.id,
      activeType: active?.data?.current?.type,
      overType: over?.data?.current?.type,
    });

    setActiveCard(null);
    setActiveList(null);

    if (!over) {
      console.log('❌ No over target - rollback');
      if (dragSnapshotRef.current) {
        setLists(dragSnapshotRef.current);
      }
      return;
    }

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (overData?.type === 'add-card') {
      console.log('❌ Over add-card - returning');
      return;
    }

    // ===================== MOVE LIST =====================
    if (activeData?.type === 'list' && overData?.type === 'list') {
      console.log('✅ List to List move detected');

      // ✅ FIX: Compare string
      const activeListItem = orderedLists.find(
        l => String(l.id) === String(active.id)
      );
      const overListItem = orderedLists.find(
        l => String(l.id) === String(over.id)
      );

      if (
        !activeListItem ||
        !overListItem ||
        String(activeListItem.id) === String(overListItem.id)
      ) {
        return;
      }

      // Calculate new position
      // ✅ FIX: Compare string
      const tempLists = orderedLists
        .filter(l => String(l.id) !== String(active.id))
        .sort((a, b) => a.position - b.position);

      const activeIndexInOriginal = orderedLists.findIndex(
        l => String(l.id) === String(active.id)
      );
      const overIndexInOriginal = orderedLists.findIndex(
        l => String(l.id) === String(over.id)
      );
      const overIndexInTemp = tempLists.findIndex(
        l => String(l.id) === String(over.id)
      );

      const insertIndex =
        activeIndexInOriginal < overIndexInOriginal
          ? overIndexInTemp + 1
          : overIndexInTemp;

      const newPosition = getPositionForIndex(tempLists, insertIndex);

      console.log('📤 Sending MoveList:', {
        listId: active.id,
        newPosition,
        from: activeIndexInOriginal,
        to: overIndexInOriginal,
      });

      try {
        await moveList(
          connection,
          workspaceData.id,
          parseInt(active.id),
          newPosition
        );

        console.log('✅ MoveList request sent successfully');
      } catch (error) {
        console.error('❌ Error moving list:', error);
        toast.error('Failed to move list');
      }

      return;
    }

    // ===================== MOVE CARD TO CARD =====================
    if (activeData?.type === 'card' && overData?.type === 'card') {
      console.log('✅ Card to Card move detected');

      const from = findCard(active.id);
      const to = findCard(over.id);

      console.log('📍 From:', from);
      console.log('📍 To:', to);

      if (!from || !to) {
        console.log('❌ from or to is null - returning');
        return;
      }

      // ✅ FIX: Compare string
      const targetList = lists.find(l => String(l.id) === String(to.listId));
      if (!targetList) {
        console.log('❌ Target list not found - returning');
        return;
      }

      // Calculate new position
      let tempCards =
        String(from.listId) === String(to.listId)
          ? targetList.cards.filter(c => String(c.id) !== String(active.id))
          : [...targetList.cards];

      tempCards.sort((a, b) => a.position - b.position);

      let targetIndex = to.cardIndex;
      if (
        String(from.listId) === String(to.listId) &&
        from.cardIndex < to.cardIndex
      ) {
        targetIndex = to.cardIndex - 1;
      }

      const newPosition = getPositionForIndex(tempCards, targetIndex);

      console.log('📤 Sending MoveCard:', {
        cardId: active.id,
        fromListId: from.listId,
        toListId: to.listId,
        newPosition,
      });

      try {
        console.log('🚀 About to call moveCardSignalR...');

        await moveCardSignalR(
          connection,
          workspaceId,
          parseInt(from.listId),
          parseInt(active.id),
          parseInt(to.listId),
          newPosition
        );

        console.log('✅ MoveCard request sent successfully');
      } catch (error) {
        console.error('❌ Error moving card:', error);
        if (dragSnapshotRef.current) {
          setLists(dragSnapshotRef.current);
        }
      }

      return;
    }

    // ===================== MOVE CARD TO EMPTY LIST =====================
    if (activeData?.type === 'card' && overData?.type === 'cards') {
      console.log('✅ Card to Empty List move detected');

      const from = findCard(active.id);
      const toListId = overData.listId;

      // ✅ FIX: Compare string
      const targetList = lists.find(l => String(l.id) === String(toListId));
      if (!targetList || !from) {
        console.log('❌ targetList or from is null - returning');
        return;
      }

      const existingCards = targetList.cards
        .filter(c => String(c.id) !== String(active.id))
        .sort((a, b) => a.position - b.position);

      const newPosition = getPositionForIndex(
        existingCards,
        existingCards.length
      );

      console.log('📤 Sending MoveCard to empty list:', {
        cardId: active.id,
        fromListId: from.listId,
        toListId,
        newPosition,
      });

      try {
        await moveCardSignalR(
          connection,
          workspaceId,
          parseInt(from.listId),
          parseInt(active.id),
          parseInt(toListId),
          newPosition
        );

        console.log('✅ MoveCard to empty list sent successfully');
      } catch (error) {
        console.error('❌ Error moving card to empty list:', error);
        if (dragSnapshotRef.current) {
          setLists(dragSnapshotRef.current);
        }
      }
    }

    console.log('❌ No matching condition for move');
  }

  // ===================== CRUD OPERATIONS =====================

  const addList = async () => {
    const title = newListTitle.trim();
    if (!title) return;

    try {
      const sortedLists = [...lists].sort((a, b) => a.position - b.position);
      const newPosition = getPositionForIndex(sortedLists, sortedLists.length);

      console.log('📤 Creating new list:', { title, newPosition });

      await createList(connection, workspaceData.id, title, newPosition);

      setNewListTitle('');
      setIsAddingList(false);
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const updateCard = async (listId, updatedCard) => {
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

  // ===================== RENDER =====================

  return (
    <>
      {!isConnected && (
        <div className='mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded'>
          <p className='font-semibold'>⚠️ Disconnected from server</p>
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
                members={members}
                onCardClick={card =>
                  setEditingCard({
                    listId: list.id,
                    listTitle: list.title,
                    card,
                  })
                }
                onUpdateCard={updateCard}
                workspaceId={workspaceId}
              />
            ))}

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
                      className='px-3 py-1.5 rounded bg-orangeFpt-500 text-white hover:bg-orangeFpt-600'
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
                  className='w-[280px] h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white/40 hover:bg-orangeFpt-50 hover:border-orangeFpt-300 hover:text-orangeFpt-700 transition-all duration-200'
                >
                  <Plus size={18} /> Add another list
                </button>
              )}
            </div>
          </SortableContext>
        </div>

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

      {editingCard && (
        <CardModal
          listId={editingCard.listId}
          listTitle={editingCard.listTitle}
          lists={lists}
          card={editingCard.card}
          members={members}
          workspaceId={workspaceData?.id}
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
});

export default TrelloBoard;
