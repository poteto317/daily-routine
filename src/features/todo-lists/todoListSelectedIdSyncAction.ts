export const syncSelectedTodoListIdIfNeeded = (
  effectiveSelectedId: string | null,
  selectedId: string | null,
  setSelectedId: (nextId: string | null) => void,
): boolean => {
  if (effectiveSelectedId === selectedId) {
    return false;
  }

  setSelectedId(effectiveSelectedId);
  return true;
};
