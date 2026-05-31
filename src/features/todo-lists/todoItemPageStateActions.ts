import type { PersistTodoLists, TodoList } from "./types";
import {
  addTodoItemToLists,
  indentTodoItemInLists,
  outdentTodoItemInLists,
  reorderTodoItemsInLists,
  toggleTodoItemInLists,
  updateTodoItemTitleInLists,
} from "./todoItemDetailActions";

type AddTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  title: string;
  insertAfterIndex?: number;
  persist: PersistTodoLists;
};

type ToggleTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  persist: PersistTodoLists;
};

type UpdateTodoIndentArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  persist: PersistTodoLists;
};

type ReorderTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  fromIndex: number;
  toIndex: number;
  persist: PersistTodoLists;
};

type UpdateTodoItemTitleArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  title: string;
  persist: PersistTodoLists;
};

export const addTodoItemAndPersist = ({
  lists,
  listId,
  title,
  insertAfterIndex,
  persist,
}: AddTodoItemArgs): TodoList[] => {
  const nextLists = addTodoItemToLists({
    lists,
    listId,
    title,
    insertAfterIndex,
  });
  persist(nextLists);
  return nextLists;
};

export const toggleTodoItemAndPersist = ({
  lists,
  listId,
  itemId,
  persist,
}: ToggleTodoItemArgs): TodoList[] => {
  const nextLists = toggleTodoItemInLists({ lists, listId, itemId });
  persist(nextLists);
  return nextLists;
};

export const indentTodoItemAndPersist = ({
  lists,
  listId,
  itemId,
  persist,
}: UpdateTodoIndentArgs): TodoList[] => {
  const nextLists = indentTodoItemInLists({ lists, listId, itemId });
  persist(nextLists);
  return nextLists;
};

export const outdentTodoItemAndPersist = ({
  lists,
  listId,
  itemId,
  persist,
}: UpdateTodoIndentArgs): TodoList[] => {
  const nextLists = outdentTodoItemInLists({ lists, listId, itemId });
  persist(nextLists);
  return nextLists;
};

export const reorderTodoItemsAndPersist = ({
  lists,
  listId,
  fromIndex,
  toIndex,
  persist,
}: ReorderTodoItemsArgs): TodoList[] => {
  const nextLists = reorderTodoItemsInLists({
    lists,
    listId,
    fromIndex,
    toIndex,
  });
  persist(nextLists);
  return nextLists;
};

export const updateTodoItemTitleAndPersist = ({
  lists,
  listId,
  itemId,
  title,
  persist,
}: UpdateTodoItemTitleArgs): TodoList[] => {
  const nextLists = updateTodoItemTitleInLists({
    lists,
    listId,
    itemId,
    title,
  });
  persist(nextLists);
  return nextLists;
};
