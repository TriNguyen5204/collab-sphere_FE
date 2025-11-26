/**
 * Script để chuẩn hóa lại position cho tất cả lists
 * Chạy file này 1 lần để fix position trước khi test drag & drop
 */
import { moveList } from './signalRHelper';
/**
 * Normalize positions cho tất cả lists
 * @param {Array} lists - Mảng lists hiện tại
 * @param {Object} connection - SignalR connection
 * @param {number} workspaceId - ID của workspace
 */
export const normalizeListPositions = async (lists, connection, workspaceId) => {
  console.log('🔧 Starting position normalization...');
  
  // 1. Sort lists theo position hiện tại
  const sortedLists = [...lists].sort((a, b) => {
    // Nếu position bằng nhau, sort theo id
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

  // 2. Tính position mới - mỗi list cách nhau 1.0
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

  // 3. Gửi updates lên server
  try {
    for (const update of updates) {
      console.log(`🚀 Updating list ${update.listId}: ${update.oldPosition} → ${update.newPosition}`);
      
      // Gọi API hoặc SignalR để update
      await moveList(connection, workspaceId, parseInt(update.listId), update.newPosition);
      
      // Đợi 100ms để tránh quá tải server
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
 * Helper function để import vào component
 */
export const useNormalizePositions = () => {
  const normalizePositions = async (lists, connection, workspaceId) => {
    const confirm = window.confirm(
      `This will normalize positions for ${lists.length} lists.\n\n` +
      'Current positions will be changed to:\n' +
      '1.0, 2.0, 3.0, ...\n\n' +
      'Continue?'
    );
    
    if (!confirm) {
      console.log('🚫 Normalization cancelled');
      return false;
    }
    
    return await normalizeListPositions(lists, connection, workspaceId);
  };
  
  return { normalizePositions };
};