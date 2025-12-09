/**
 * Sort lists by position
 */
export const sortListsByPosition = (lists) => {
  return [...lists].sort((a, b) => a.position - b.position);
};

/**
 * Sort cards by position
 */
export const sortCardsByPosition = (cards) => {
  return [...cards].sort((a, b) => a.position - b.position);
};

/**
 * Sort lists and cards inside each list
 */
export const sortListsAndCards = (lists) => {
  return lists
    .map(list => ({
      ...list,
      cards: sortCardsByPosition(list.cards),
    }))
    .sort((a, b) => a.position - b.position);
};