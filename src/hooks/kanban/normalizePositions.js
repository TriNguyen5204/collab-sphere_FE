/**
 * Script to normalize positions for all lists
 * Run this file once to fix positions before testing drag & drop
 */
import { moveList } from './signalRHelper';
import useToastConfirmation from '../useToastConfirmation';
/**
 * Normalize positions for all lists
 * @param {Array} lists - Current lists array
 * @param {Object} connection - SignalR connection
 * @param {number} workspaceId - Workspace ID
 */
export const normalizeListPositions = async (lists, connection, workspaceId) => {
  console.log('🔧 Starting position normalization...');
  
  // 1. Sort lists by current position
  const sortedLists = [...lists].sort((a, b) => {
    // If positions are equal, sort by id
    if (a.position === b.position) {
      return parseInt(a.id) - parseInt(b.id);
    }
    return a.position - b.position;
  });

  console.log('📊 Current positions:', sortedLists.map(l => ({
    id: l.id,
    title: l.title,
    oldPosition: l.position
  })));

  // 2. Calculate new position - each list separated by 1.0
  const updates = sortedLists.map((list, index) => ({
    listId: list.id,
    oldPosition: list.position,
    newPosition: (index + 1) * 1.0, // 1.0, 2.0, 3.0, ...
    title: list.title
  }));

  console.log('✨ New positions:', updates.map(u => ({
    id: u.listId,
    title: u.title,
    oldPosition: u.oldPosition,
    newPosition: u.newPosition
  })));

  // 3. Send updates to server
  try {
    for (const update of updates) {
      console.log(`🚀 Updating list ${update.listId}: ${update.oldPosition} → ${update.newPosition}`);
      
      // Call API or SignalR to update
      await moveList(connection, workspaceId, parseInt(update.listId), update.newPosition);
      
      // Wait 100ms to avoid server overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ All positions normalized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error normalizing positions:', error);
    return false;
  }
};

/**
 * Helper function to import into component
 */
export const useNormalizePositions = () => {
  const confirmWithToast = useToastConfirmation();

  const normalizePositions = async (lists, connection, workspaceId) => {
    const confirm = await confirmWithToast(
      `This will normalize positions for ${lists.length} lists.`,
      {
        description: 'Current positions will be changed to: 1.0, 2.0, 3.0, ...',
        confirmText: "Normalize",
        cancelText: "Cancel"
      }
    );
    
    if (!confirm) {
      console.log('🚫 Normalization cancelled');
      return false;
    }
    
    return await normalizeListPositions(lists, connection, workspaceId);
  };
  
  return { normalizePositions };
};