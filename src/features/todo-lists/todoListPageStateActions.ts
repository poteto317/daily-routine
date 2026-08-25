import type { PersistTodoLists, TodoList } from "./types";
import {
  updateTodoListAddItemPositionInLists,
  updateTodoListHideCompletedInLists,
} from "./todoListDetailActions";

type UpdateTodoListAddItemPositionArgs = {
  lists: TodoList[];
  listId: string;
  position: "last" | "first";
  persist: PersistTodoLists;
};

export const updateTodoListAddItemPositionAndPersist = ({
  lists,
  listId,
  position,
  persist,
}: UpdateTodoListAddItemPositionArgs): TodoList[] => {
  const nextLists = updateTodoListAddItemPositionInLists({
    lists,
    listId,
    position,
  });
  persist(nextLists);
  return nextLists;
};

type UpdateTodoListHideCompletedArgs = {
  lists: TodoList[];
  listId: string;
  hideCompleted: boolean;
  persist: PersistTodoLists;
};

export const updateTodoListHideCompletedAndPersist = ({
  lists,
  listId,
  hideCompleted,
  persist,
}: UpdateTodoListHideCompletedArgs): TodoList[] => {
  const nextLists = updateTodoListHideCompletedInLists({
    lists,
    listId,
    hideCompleted,
  });
  persist(nextLists);
  return nextLists;
};
