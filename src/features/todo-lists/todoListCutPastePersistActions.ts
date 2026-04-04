import {
  cutTodoItemsFromLists,
  pasteTodoItemsToLists,
} from "./todoListCutPasteActions";
import type { PersistTodoLists, TodoList, TodoListItem } from "./types";

type CutTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  itemIds: ReadonlySet<string>;
  persist: PersistTodoLists;
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

  if (cutItems.length === 0) {
    return cutItems;
  }

  persist(updatedLists);
  return cutItems;
};

type PasteTodoItemsArgs = {
  lists: TodoList[];
  listId: string;
  items: TodoListItem[];
  persist: PersistTodoLists;
};

export const pasteTodoItemsAndPersist = ({
  lists,
  listId,
  items,
  persist,
}: PasteTodoItemsArgs): void => {
  if (items.length === 0) {
    return;
  }

  if (!lists.some((list) => list.id === listId)) {
    return;
  }

  const nextLists = pasteTodoItemsToLists({ lists, listId, items });
  persist(nextLists);
};
