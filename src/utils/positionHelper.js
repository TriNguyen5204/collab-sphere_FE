/**
 * Tính position mới cho item dựa trên vị trí trước và sau
 * @param {number|null} prevPosition - Position của item trước (null nếu là đầu tiên)
 * @param {number|null} nextPosition - Position của item sau (null nếu là cuối cùng)
 * @returns {number} Position mới
 */
export const calculateNewPosition = (prevPosition, nextPosition) => {

  // ✅ Convert to number và handle null/undefined
  const prev =
    prevPosition !== null && prevPosition !== undefined
      ? Number(prevPosition)
      : null;
  const next =
    nextPosition !== null && nextPosition !== undefined
      ? Number(nextPosition)
      : null;

  // ✅ Validate
  if (prev !== null && isNaN(prev)) {
    console.error('❌ Invalid prev:', prevPosition);
    return 1.0;
  }
  if (next !== null && isNaN(next)) {
    console.error('❌ Invalid next:', nextPosition);
    return 1.0;
  }

  let result;

  if (prev === null && next !== null) {
    result = next / 2.0;
  } else if (prev !== null && next === null) {
    result = prev + 1.0;
  } else if (prev !== null && next !== null) {
    result = (prev + next) / 2.0;
  } else {
    result = 1.0;
  }

  // ✅ BỎ LÀM TRÒN - giữ nguyên precision của JavaScript
  // const floatResult = parseFloat(result.toFixed(1)); // ❌ CŨ

  // ✅ Final check
  if (isNaN(result)) {
    console.error('❌ NaN result!');
    return 1.0;
  }
  return result;
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