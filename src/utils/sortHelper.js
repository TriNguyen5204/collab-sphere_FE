/**
 * Sort lists theo position
 */
export const sortListsByPosition = (lists) => {
  return [...lists].sort((a, b) => a.position - b.position);
};

/**
 * Sort cards theo position
 */
export const sortCardsByPosition = (cards) => {
  return [...cards].sort((a, b) => a.position - b.position);
};

/**
 * Sort lists và cards bên trong mỗi list
 */
export const sortListsAndCards = (lists) => {
  return lists
    .map(list => ({
      ...list,
      cards: sortCardsByPosition(list.cards),
    }))
    .sort((a, b) => a.position - b.position);
};