import { isTodoListVisible } from "./todoListVisibilityPredicate";
import type { TodoList } from "./types";

export const resolveSelectedTodoListId = (
  lists: TodoList[],
  selectedId: string | null,
): string | null => {
  const visibleLists = lists.filter(isTodoListVisible);
  const hasSelectedList = visibleLists.some((list) => list.id === selectedId);

  if (hasSelectedList) {
    return selectedId;
  }

  return visibleLists[0]?.id ?? null;
};

export const findTodoListById = (
  lists: TodoList[],
  listId: string,
): TodoList | null => {
  return lists.find((list) => list.id === listId) ?? null;
};
