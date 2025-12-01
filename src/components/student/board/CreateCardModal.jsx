import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlignLeft,
  ListChecks,
  CalendarDays,
  Users,
  Flag,
} from 'lucide-react';
import { useSignalRContext } from '../../../context/kanban/useSignalRContext';
import { createCard } from '../../../hooks/kanban/signalRHelper';
import { toast } from 'sonner';
import { calculateNewPosition } from '../../../utils/positionHelper';

const riskOptions = [
  { id: 'low', label: 'Low', color: 'bg-green-500' },
  { id: 'medium', label: 'Medium', color: 'bg-orange-500' },
  { id: 'high', label: 'High', color: 'bg-red-500' },
];

const CreateCardModal = ({
  isOpen,
  onClose,
  listId,
  workspaceId,
  members,
  list,
  onCardCreated,
}) => {
  const { connection, isConnected } = useSignalRContext();
  const [isCreating, setIsCreating] = useState(false);
  console.log('member', members)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([
    {
      id: Date.now(),
      title: '',
      subtasks: [{ id: Date.now() + 1, title: '', done: false }],
    },
  ]);
  const [risk, setRisk] = useState('medium');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const toggleMember = member => {
    if (selectedMembers.some(m => m.studentId === member.studentId)) {
      setSelectedMembers(
        selectedMembers.filter(m => m.studentId !== member.studentId)
      );
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a card title');
      return;
    }

    if (!isConnected || !connection) {
      toast.error('Not connected to server! Please check your connection.');
      return;
    }

    setIsCreating(true);

    try {
      // Chuẩn bị assignmentList
      const existingCards = list?.cards || [];
      const sortedCards = [...existingCards].sort(
        (a, b) => a.position - b.position
      );

      const prevPosition =
        sortedCards.length > 0
          ? sortedCards[sortedCards.length - 1].position
          : null;
      const nextPosition = null;

      const newPosition = calculateNewPosition(prevPosition, nextPosition);
      const floatPosition = parseFloat(newPosition.toFixed(1));
      let formattedDueDate = null;

      if (dueDate) {
        const dateObj = new Date(dueDate);

        // Kiểm tra date hợp lệ
        if (isNaN(dateObj.getTime())) {
          toast.error('Invalid due date format');
          setIsCreating(false);
          return;
        }
        formattedDueDate = dateObj.toISOString();
      }
      const assignmentList = selectedMembers.map(m => ({
        studentId: m.studentId,
        studentName: m.studentName,
      }));

      // Chuẩn bị tasksOfCard
      const tasksOfCard = tasks
        .filter(t => t.title.trim())
        .map((task, index) => ({
          taskTitle: task.title,
          taskOrder: index + 1,
          subTaskOfCard: task.subtasks
            .filter(st => st.title.trim())
            .map((subtask, subIndex) => ({
              subTaskTitle: subtask.title,
              subTaskOrder: subIndex + 1,
              isDone: subtask.done,
            })),
        }));
      const tempCardId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const newCardForUI = {
        id: tempCardId,
        title: title,
        description: description,
        riskLevel: risk,
        dueAt: formattedDueDate,
        position: floatPosition,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        assignedMembers: selectedMembers.map(m => ({
          studentId: m.studentId,
          studentName: m.studentName,
          avatarImg: m.avatarImg,
        })),
        tasks: tasksOfCard.map((task, idx) => ({
          taskId: `temp-task-${Date.now()}-${idx}`,
          taskTitle: task.taskTitle,
          isDone: false,
          subTaskDtos: task.subTaskOfCard.map((st, subIdx) => ({
            subTaskId: `temp-subtask-${Date.now()}-${idx}-${subIdx}`,
            subTaskTitle: st.SubTaskTitle,
            isDone: st.IsDone,
          })),
        })),
      };
      if (onCardCreated) {
        onCardCreated(listId, newCardForUI);
      }

      // Gọi SignalR để tạo card
      await createCard(
        connection,
        workspaceId,
        parseInt(listId),
        title,
        description,
        risk,
        floatPosition,
        formattedDueDate || null,
        assignmentList,
        tasksOfCard
      );

      // Reset form và đóng modal
      setTitle('');
      setDescription('');
      setTasks([
        {
          id: Date.now(),
          title: '',
          subtasks: [{ id: Date.now() + 1, title: '', done: false }],
        },
      ]);
      setRisk('Normal');
      setSelectedMembers([]);
      setDueDate('');

      onClose();
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-2 py-8 overflow-auto'>
      <div className='w-full max-w-2xl bg-[#f4f5f7] p-6 rounded-xl shadow-xl relative'>
        {/* Close */}
        <button
          className='absolute top-4 right-4 hover:bg-gray-300/50 p-1 rounded'
          onClick={onClose}
          disabled={isCreating}
        >
          <X size={20} />
        </button>

        {/* Connection Status Warning */}
        {!isConnected && (
          <div className='mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded'>
            <p className='font-semibold'>⚠️ Not connected to server</p>
            <p className='text-sm'>Please wait for connection to restore.</p>
          </div>
        )}

        {/* Creating Indicator */}
        {isCreating && (
          <div className='mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded'>
            <p className='font-semibold'>Creating card...</p>
          </div>
        )}

        {/* Title */}
        <div className='mb-6'>
          <div className='flex items-start gap-3'>
            <AlignLeft className='mt-1 text-gray-700' />
            <div className='flex-1'>
              <input
                className='text-xl font-semibold bg-transparent border-none outline-none w-full'
                placeholder='Card title...'
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isCreating}
              />
              <p className='text-sm text-gray-600'>In list • Tasks</p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <Users className='text-gray-700' size={18} />
            <h3 className='font-medium'>Members</h3>
          </div>

          <div className='flex items-center gap-3 flex-wrap pl-8'>
            {selectedMembers.map(m => (
              <img
                key={m.studentId}
                src={m.avatarImg}
                className='w-8 h-8 rounded-full border-2 border-white shadow cursor-pointer'
                title={m.studentName}
                onClick={() => toggleMember(m)}
              />
            ))}

            {/* Add member dropdown */}
            <div className='relative group'>
              <button
                className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400'
                disabled={isCreating}
              >
                <Plus size={18} />
              </button>

              <div className='absolute left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 hidden group-hover:block z-10'>
                {members?.map(m => (
                  <div
                    key={m.studentId}
                    className='flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded'
                    onClick={() => toggleMember(m)}
                  >
                    <img src={m.avatarImg} className='w-7 h-7 rounded-full' />
                    <span>{m.studentName}</span>
                    {selectedMembers.some(
                      sm => sm.studentId === m.studentId
                    ) && (
                      <CheckCircle2
                        size={16}
                        className='text-green-600 ml-auto'
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <CalendarDays className='text-gray-700' size={18} />
            <h3 className='font-medium'>Due Date</h3>
          </div>

          <div className='pl-8'>
            <input
              type='date'
              className='px-3 py-2 rounded-md border border-gray-300 bg-white'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Risk Level */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <Flag className='text-gray-700' size={18} />
            <h3 className='font-medium'>Risk Level</h3>
          </div>

          <div className='pl-8 flex gap-3'>
            {riskOptions.map(r => (
              <button
                key={r.id}
                onClick={() => setRisk(r.id)}
                disabled={isCreating}
                className={`px-3 py-1.5 rounded-md text-white text-sm 
                  ${r.color} 
                  ${risk === r.id ? 'opacity-100 ring-2 ring-offset-2 ring-gray-400' : 'opacity-40 hover:opacity-70'}
                  disabled:cursor-not-allowed
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-2'>
            <AlignLeft size={18} className='text-gray-700' />
            <h3 className='font-medium'>Description</h3>
          </div>

          <textarea
            className='w-full rounded-md p-3 border border-gray-300 bg-white min-h-[90px]'
            placeholder='Add a more detailed description...'
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isCreating}
          />
        </div>

        {/* Checklist (Multiple Tasks + Subtasks) */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <ListChecks size={18} className='text-gray-700' />
              <h3 className='font-medium'>Tasks</h3>
            </div>

            {/* Add New Task Group */}
            <button
              onClick={() =>
                setTasks([
                  ...tasks,
                  {
                    id: Date.now(),
                    title: '',
                    subtasks: [{ id: Date.now() + 1, title: '', done: false }],
                  },
                ])
              }
              disabled={isCreating}
              className='px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1 disabled:opacity-50'
            >
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className='space-y-4'>
            {tasks.map(taskGroup => (
              <div
                key={taskGroup.id}
                className='bg-white p-4 rounded-md border border-gray-300'
              >
                {/* Task Title + Remove Task */}
                <div className='flex items-center justify-between mb-3'>
                  <input
                    className='font-medium text-gray-700 outline-none bg-transparent border-b border-gray-300 pb-1 w-full mr-3'
                    placeholder='Task title...'
                    value={taskGroup.title}
                    onChange={e =>
                      setTasks(
                        tasks.map(t =>
                          t.id === taskGroup.id
                            ? { ...t, title: e.target.value }
                            : t
                        )
                      )
                    }
                    disabled={isCreating}
                  />

                  {/* Remove Task Group */}
                  <button
                    onClick={() =>
                      setTasks(tasks.filter(t => t.id !== taskGroup.id))
                    }
                    disabled={isCreating}
                    className='text-red-500 hover:text-red-700 disabled:opacity-50'
                    title='Remove task group'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Subtasks */}
                <div className='space-y-2'>
                  {taskGroup.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      className='flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-300'
                    >
                      {/* Toggle done */}
                      <button
                        onClick={() =>
                          setTasks(
                            tasks.map(t =>
                              t.id === taskGroup.id
                                ? {
                                    ...t,
                                    subtasks: t.subtasks.map(s =>
                                      s.id === sub.id
                                        ? { ...s, done: !s.done }
                                        : s
                                    ),
                                  }
                                : t
                            )
                          )
                        }
                        disabled={isCreating}
                      >
                        {sub.done ? (
                          <CheckCircle2 className='text-green-500' size={20} />
                        ) : (
                          <Circle className='text-gray-500' size={20} />
                        )}
                      </button>

                      {/* Subtask input */}
                      <input
                        className={`flex-1 outline-none bg-transparent ${
                          sub.done ? 'line-through text-gray-400' : ''
                        }`}
                        placeholder='Subtask...'
                        value={sub.title}
                        onChange={e =>
                          setTasks(
                            tasks.map(t =>
                              t.id === taskGroup.id
                                ? {
                                    ...t,
                                    subtasks: t.subtasks.map(s =>
                                      s.id === sub.id
                                        ? { ...s, title: e.target.value }
                                        : s
                                    ),
                                  }
                                : t
                            )
                          )
                        }
                        disabled={isCreating}
                      />

                      {/* Delete subtask */}
                      <button
                        onClick={() =>
                          setTasks(
                            tasks.map(t =>
                              t.id === taskGroup.id
                                ? {
                                    ...t,
                                    subtasks: t.subtasks.filter(
                                      s => s.id !== sub.id
                                    ),
                                  }
                                : t
                            )
                          )
                        }
                        disabled={isCreating}
                        className='hover:text-red-500 disabled:opacity-50'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask */}
                <button
                  onClick={() =>
                    setTasks(
                      tasks.map(t =>
                        t.id === taskGroup.id
                          ? {
                              ...t,
                              subtasks: [
                                ...t.subtasks,
                                { id: Date.now(), title: '', done: false },
                              ],
                            }
                          : t
                      )
                    )
                  }
                  disabled={isCreating}
                  className='mt-3 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1 disabled:opacity-50'
                >
                  <Plus size={14} /> Add subtask
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            className='px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-sm'
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>

          <button
            className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            onClick={handleSave}
            disabled={isCreating || !isConnected || !title.trim()}
          >
            {isCreating ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Creating...
              </>
            ) : (
              'Create card'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
