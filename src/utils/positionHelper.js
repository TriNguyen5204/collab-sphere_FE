/**
 * Tính position mới cho item dựa trên vị trí trước và sau
 * @param {number|null} prevPosition - Position của item trước (null nếu là đầu tiên)
 * @param {number|null} nextPosition - Position của item sau (null nếu là cuối cùng)
 * @returns {number} Position mới
 */
export const calculateNewPosition = (prevPosition, nextPosition) => {
  let result;
  
  // Nếu là item đầu tiên
  if (prevPosition === null && nextPosition !== null) {
    result = nextPosition / 2.0;
  }
  // Nếu là item cuối cùng
  else if (prevPosition !== null && nextPosition === null) {
    result = prevPosition + 1.0; // ✅ Thêm .0 để luôn là float
  }
  // Nếu ở giữa 2 items
  else if (prevPosition !== null && nextPosition !== null) {
    result = (prevPosition + nextPosition) / 2.0;
  }
  // Nếu là item duy nhất
  else {
    result = 1.0;
  }
  
  const floatResult = parseFloat(result.toFixed(1));
  
  return floatResult;
};

/**
 * Lấy position của item tại index trong mảng đã sắp xếp
 * @param {Array} items - Mảng items đã sort theo position
 * @param {number} targetIndex - Index muốn insert
 * @returns {number} Position mới
 */
export const getPositionForIndex = (items, targetIndex) => {
  if (items.length === 0) {
    return 1.0; 
  }
  
  if (targetIndex === 0) {
    return calculateNewPosition(null, items[0].position);
  }
  
  if (targetIndex >= items.length) {
    return calculateNewPosition(items[items.length - 1].position, null);
  }
  
  const prevPosition = items[targetIndex - 1].position;
  const nextPosition = items[targetIndex].position;
  
  return calculateNewPosition(prevPosition, nextPosition);
};