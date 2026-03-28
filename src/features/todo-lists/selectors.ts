import type { TodoList, TodoListItem } from "./types";

export const getVisibleTodoItems = (
  items: TodoListItem[],
  hideCompleted: boolean,
): TodoListItem[] => {
  return hideCompleted ? items.filter((item) => !item.isCompleted) : items;
};

export const resolveSelectedTodoListId = (
  lists: TodoList[],
  selectedId: string | null,
): string | null => {
  const visibleLists = lists.filter((list) => !list.isHidden);
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
