import type { TodoItemBgColorValue, TodoList } from "./types";
import {
  updateItemBgColorInList,
  updateAllItemsBgColorInList,
} from "./todoItemBgColorHelpers";

export const updateTodoItemBgColorInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
  bgColor: TodoItemBgColorValue;
}): TodoList[] => {
  const { lists, listId, itemId, bgColor } = params;

  return updateItemBgColorInList(lists, listId, itemId, bgColor);
};

export const updateAllTodoItemsBgColorInLists = (params: {
  lists: TodoList[];
  listId: string;
  bgColor: TodoItemBgColorValue;
}): TodoList[] => {
  const { lists, listId, bgColor } = params;

  return updateAllItemsBgColorInList(lists, listId, bgColor);
};
