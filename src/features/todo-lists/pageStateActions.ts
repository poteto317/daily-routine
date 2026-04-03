import type { TodoList, TodoListItem } from "./types";
import {
  addTodoItemToLists,
  confirmAndDeleteTodoItem,
  confirmAndDeleteTodoList,
  cutTodoItemsFromLists,
  indentTodoItemInLists,
  outdentTodoItemInLists,
  pasteTodoItemsToLists,
  reorderTodoItemsInLists,
  updateTodoItemTitleInLists,
  updateTodoListTitleInLists,
  toggleTodoItemInLists,
} from "./detailActions";

type PersistLists = (nextLists: TodoList[]) => void;

type DeleteTodoListArgs = {
  lists: TodoList[];
  list: TodoList;
  message: string;
  persist: PersistLists;
  confirmDelete?: (message: string) => boolean;
};

type AddTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  title: string;
  persist: PersistLists;
};

type ToggleTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  persist: PersistLists;
};

type DeleteTodoItemArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  title: string;
  message: string;
  persist: PersistLists;
  confirmDelete?: (message: string) => boolean;
};

type UpdateTodoIndentArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  persist: PersistLists;
};

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

export const deleteTodoListAndPersist = ({
  lists,
  list,
  message,
  persist,
  confirmDelete = (nextMessage) => window.confirm(nextMessage),
}: DeleteTodoListArgs): boolean => {
  const nextLists = confirmAndDeleteTodoList({
    lists,
    list,
    message,
    confirmDelete,
  });

  if (!nextLists) {
    return false;
  }

  persist(nextLists);
  return true;
};

export const addTodoItemAndPersist = ({
  lists,
  listId,
  title,
  persist,
}: AddTodoItemArgs): TodoList[] => {
  const nextLists = addTodoItemToLists({ lists, listId, title });
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

export const deleteTodoItemAndPersist = ({
  lists,
  listId,
  itemId,
  message,
  persist,
  confirmDelete = (nextMessage) => window.confirm(nextMessage),
}: DeleteTodoItemArgs): TodoList[] | null => {
  const nextLists = confirmAndDeleteTodoItem({
    lists,
    listId,
    itemId,
    message,
    confirmDelete,
  });

  if (!nextLists) {
    return null;
  }

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

type ReorderTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  fromIndex: number;
  toIndex: number;
  persist: PersistLists;
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

type UpdateTodoItemTitleArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  title: string;
  persist: PersistLists;
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

type UpdateTodoListTitleArgs = {
  lists: TodoList[];
  listId: string;
  title: string;
  persist: PersistLists;
};

export const updateTodoListTitleAndPersist = ({
  lists,
  listId,
  title,
  persist,
}: UpdateTodoListTitleArgs): TodoList[] => {
  const nextLists = updateTodoListTitleInLists({ lists, listId, title });
  persist(nextLists);
  return nextLists;
};

type CutTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  itemIds: ReadonlySet<string>;
  persist: PersistLists;
};

export const cutTodoItemsAndPersist = ({
  lists,
  listId,
  itemIds,
  persist,
}: CutTodoItemsArgs): TodoListItem[] => {
  const { updatedLists, cutItems } = cutTodoItemsFromLists({
    lists,
    listId,
    itemIds,
  });
  persist(updatedLists);
  return cutItems;
};

type PasteTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  items: TodoListItem[];
  persist: PersistLists;
};

export const pasteTodoItemsAndPersist = ({
  lists,
  listId,
  items,
  persist,
}: PasteTodoItemsArgs): void => {
  const nextLists = pasteTodoItemsToLists({ lists, listId, items });
  persist(nextLists);
};
