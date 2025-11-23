/**
 * SignalR Helper Functions
 * Các hàm tiện ích để gọi SignalR Hub methods
 */

// 1. CREATE LIST
export const createList = async (connection, workspaceId, title, position) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    title: title,
    position: position || 1.0,
  };

  await connection.invoke('CreateList', workspaceId, command);
};

// 2. RENAME LIST
export const renameList = async (connection, workspaceId, listId, newTitle) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { newTitle };

  await connection.invoke('RenameList', workspaceId, listId, command);
};

// 3. MOVE LIST
export const moveList = async (
  connection,
  workspaceId,
  listId,
  newPosition
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { newPosition };

  await connection
    .invoke('MoveList', workspaceId, listId, command)
    .then(() => console.log(`Move List success: with ID ${listId} to position ${newPosition}`))
    .catch(err => console.log('Lỗi: ' + err.toString()));
};

// 4. CREATE CARD
export const createCard = async (
  connection,
  workspaceId,
  listId,
  cardTitle,
  cardDescription = '',
  riskLevel = 'Medium',
  position = 1.0,
  dueAt = null,
  assignmentList = [],
  tasksOfCard = []
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    CardTitle: cardTitle,
    CardDescription: cardDescription || '',
    RiskLevel: riskLevel,
    Position: position,
    IsComplete: false,
    DueAt: dueAt,

    // ✅ AssignmentList - Backend expect
    AssignmentList: (assignmentList || []).map(member => ({
      StudentId: member.studentId,
      StudentName: member.studentName,
    })),

    // ✅ TasksOfCard - Backend expect
    TasksOfCard: (tasksOfCard || []).map(task => ({
      TaskTitle: task.taskTitle,
      TaskOrder: task.taskOrder,
      SubTaskOfCard: (task.subTaskOfCard || []).map(subtask => ({
        SubTaskTitle: subtask.subTaskTitle,
        SubTaskOrder: subtask.subTaskOrder,
        IsDone: subtask.isDone,
      })),
    })),
  };
  console.log('🔍 List ID type:', typeof listId, 'value:', listId);
  console.log('Command', command);

  await connection
    .invoke('CreateCardAndAssignMember', workspaceId, listId, command)
    .then(() => console.log('Sent CreateCardAndAssignMember command success!'))
    .catch(err => console.log('Lỗi CreateCard: ' + err.toString()));
};

// 5. MOVE CARD
export const moveCard = async (
  connection,
  workspaceId,
  currentListId,
  cardId,
  newListId,
  newPosition
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    newListId,
    newPosition,
  };
  console.log('listId', typeof currentListId, 'cardId', typeof cardId, 'Command', command)

  await connection.invoke(
    'MoveCard',
    workspaceId,
    currentListId,
    cardId,
    command
  ).then(() => console.log(`EVENT RECEIVED: ReceiveCardMoved | Card ID: ${cardId}, New List ID: ${newListId}, New Position: ${newPosition}`))
    .catch(err => console.log('Lỗi: ' + err.toString()));
};

// 6. UPDATE CARD DETAILS
export const updateCardDetails = async (
  connection,
  workspaceId,
  listId,
  cardId,
  updates
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    CardTitle: updates.title,
    CardDescription: updates.description,
    RiskLevel: updates.riskLevel,
    DueAt: updates.dueAt,
  };

  await connection.invoke(
    'UpdateCardDetails',
    workspaceId,
    listId,
    cardId,
    command
  );
};

// 7. MARK/UNMARK CARD COMPLETE
export const markCardComplete = async (
  connection,
  workspaceId,
  listId,
  cardId,
  isComplete
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { IsComplete: isComplete };

  await connection.invoke(
    'MarkUnMarkCompleteCard',
    workspaceId,
    listId,
    cardId,
    command
  );
};

// 8. DELETE CARD
export const deleteCard = async (connection, workspaceId, listId, cardId) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {};

  await connection.invoke('DeleteCard', workspaceId, listId, cardId, command);
};

// 9. ASSIGN MEMBER TO CARD
export const assignMemberToCard = async (
  connection,
  workspaceId,
  listId,
  cardId,
  studentId,
  studentName
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    StudentId: studentId,
    StudentName: studentName,
  };

  await connection.invoke(
    'AssignMembersToCard',
    workspaceId,
    listId,
    cardId,
    command
  );
};

// 10. UNASSIGN MEMBER FROM CARD
export const unassignMemberFromCard = async (
  connection,
  workspaceId,
  listId,
  cardId,
  studentId
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { StudentId: studentId };

  await connection.invoke(
    'UnAssignMembersToCard',
    workspaceId,
    listId,
    cardId,
    command
  );
};

// 11. CREATE TASK
export const createTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskTitle
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { TaskTitle: taskTitle };

  await connection.invoke('CreateTask', workspaceId, listId, cardId, command);
};

// 12. RENAME TASK
export const renameTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId,
  newTitle
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { NewTitle: newTitle };

  await connection.invoke(
    'RenameTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    command
  );
};

// 13. DELETE TASK
export const deleteTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {listId, cardId, taskId};
  const deleteTaskCommand = {};
  console.log('command', command)

  await connection.invoke(
    'DeleteTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    deleteTaskCommand
  ).then(() => console.log('Sent DeleteTask command success!'))
    .catch(err => console.log('Lỗi DeleteTask: ' + err.toString()));
};

// 14. CREATE SUBTASK
export const createSubTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId,
  subTaskTitle,
  isDone = false
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {
    SubTaskTitle: subTaskTitle,
    IsDone: isDone,
  };

  await connection.invoke(
    'CreateSubTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    command
  );
};

// 15. RENAME SUBTASK
export const renameSubTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId,
  subTaskId,
  newTitle
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { SubTaskNewTitle: newTitle };

  await connection.invoke(
    'RenameSubTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    subTaskId,
    command
  );
};

// 16. DELETE SUBTASK
export const deleteSubTask = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId,
  subTaskId
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = {};

  await connection.invoke(
    'DeleteSubTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    subTaskId,
    command
  );
};

// 17. MARK/UNMARK SUBTASK DONE
export const markSubTaskDone = async (
  connection,
  workspaceId,
  listId,
  cardId,
  taskId,
  subTaskId,
  isDone
) => {
  if (!connection) throw new Error('No SignalR connection');

  const command = { IsDone: isDone };

  await connection.invoke(
    'MarkUnMarkdoneSubTask',
    workspaceId,
    listId,
    cardId,
    taskId,
    subTaskId,
    command
  );
};

// Error Handler Wrapper
export const withErrorHandling = async (fn, errorCallback) => {
  try {
    await fn();
  } catch (error) {
    console.error('SignalR Error:', error);
    if (errorCallback) {
      errorCallback(error);
    }
  }
};
