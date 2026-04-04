import type { PersistTodoLists, TodoItemBgColorValue, TodoList } from "./types";
import {
  updateTodoItemBgColorInLists,
  updateAllTodoItemsBgColorInLists,
} from "./todoItemBgColorDetailActions";

type UpdateTodoItemBgColorArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  bgColor: TodoItemBgColorValue | undefined;
  persist: PersistTodoLists;
};

export const updateTodoItemBgColorAndPersist = ({
  lists,
  listId,
  itemId,
  bgColor,
  persist,
}: UpdateTodoItemBgColorArgs): TodoList[] => {
  const nextLists = updateTodoItemBgColorInLists({
    lists,
    listId,
    itemId,
    bgColor,
  });
  persist(nextLists);
  return nextLists;
};

type UpdateAllTodoItemsBgColorArgs = {
  lists: TodoList[];
  listId: string;
  bgColor: TodoItemBgColorValue | undefined;
  persist: PersistTodoLists;
};

export const updateAllTodoItemsBgColorAndPersist = ({
  lists,
  listId,
  bgColor,
  persist,
}: UpdateAllTodoItemsBgColorArgs): TodoList[] => {
  const nextLists = updateAllTodoItemsBgColorInLists({
    lists,
    listId,
    bgColor,
  });
  persist(nextLists);
  return nextLists;
};
