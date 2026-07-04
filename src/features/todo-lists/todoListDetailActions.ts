import {
  updateListAddItemPosition,
  updateListHideCompleted,
  updateListMoveCompletedToBottom,
  updateListTitle,
} from "./todoListMutations";
import type { TodoList } from "./types";

export const updateTodoListTitleInLists = (params: {
  lists: TodoList[];
  listId: string;
  title: string;
}): TodoList[] => {
  const { lists, listId, title } = params;

  return updateListTitle(lists, listId, title);
};

export const updateTodoListAddItemPositionInLists = (params: {
  lists: TodoList[];
  listId: string;
  position: "last" | "first";
}): TodoList[] => {
  const { lists, listId, position } = params;

  return updateListAddItemPosition(lists, listId, position);
};

export const updateTodoListMoveCompletedToBottomInLists = (params: {
  lists: TodoList[];
  listId: string;
  moveCompletedToBottom: boolean;
}): TodoList[] => {
  const { lists, listId, moveCompletedToBottom } = params;

  return updateListMoveCompletedToBottom(lists, listId, moveCompletedToBottom);
};

export const updateTodoListHideCompletedInLists = (params: {
  lists: TodoList[];
  listId: string;
  hideCompleted: boolean;
}): TodoList[] => {
  const { lists, listId, hideCompleted } = params;

  return updateListHideCompleted(lists, listId, hideCompleted);
};
