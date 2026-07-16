import type { PersistTodoLists, TodoList } from "./types";
import {
  updateTodoListAddItemPositionInLists,
  updateTodoListGroupByCategoryInLists,
  updateTodoListHideCompletedInLists,
  updateTodoListMoveCompletedToBottomInLists,
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
  const nextLists = updateTodoListAddItemPositionInLists({ lists, listId, position });
  persist(nextLists);
  return nextLists;
};

type UpdateTodoListMoveCompletedToBottomArgs = {
  lists: TodoList[];
  listId: string;
  moveCompletedToBottom: boolean;
  persist: PersistTodoLists;
};

export const updateTodoListMoveCompletedToBottomAndPersist = ({
  lists,
  listId,
  moveCompletedToBottom,
  persist,
}: UpdateTodoListMoveCompletedToBottomArgs): TodoList[] => {
  const nextLists = updateTodoListMoveCompletedToBottomInLists({
    lists,
    listId,
    moveCompletedToBottom,
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

type UpdateTodoListGroupByCategoryArgs = {
  lists: TodoList[];
  listId: string;
  groupByCategory: boolean;
  persist: PersistTodoLists;
};

export const updateTodoListGroupByCategoryAndPersist = ({
  lists,
  listId,
  groupByCategory,
  persist,
}: UpdateTodoListGroupByCategoryArgs): TodoList[] => {
  const nextLists = updateTodoListGroupByCategoryInLists({
    lists,
    listId,
    groupByCategory,
  });
  persist(nextLists);
  return nextLists;
};
