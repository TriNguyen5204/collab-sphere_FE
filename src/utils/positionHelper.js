/**
 * Calculate new position for item based on previous and next positions
 * @param {number|null} prevPosition - Position of previous item (null if first)
 * @param {number|null} nextPosition - Position of next item (null if last)
 * @returns {number} New position
 */
export const calculateNewPosition = (prevPosition, nextPosition) => {

  // ✅ Convert to number and handle null/undefined
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

  // ✅ REMOVE ROUNDING - keep JavaScript precision
  // const floatResult = parseFloat(result.toFixed(1)); // ❌ OLD

  // ✅ Final check
  if (isNaN(result)) {
    console.error('❌ NaN result!');
    return 1.0;
  }
  return result;
};

/**
 * Get position of item at index in sorted array
 * @param {Array} items - Array of items sorted by position
 * @param {number} targetIndex - Index to insert
 * @returns {number} New position
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