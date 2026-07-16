import { normalizeTitle } from "./todoListTitleNormalization";
import type { PersistTodoLists, TodoList } from "./types";
import { deleteTodoListAndPersist } from "./todoListDeletePersistActions";
import { updateTodoListTitleAndPersist } from "./todoListTitleUpdatePersistAction";
import {
  updateTodoListAddItemPositionAndPersist,
  updateTodoListGroupByCategoryAndPersist,
  updateTodoListHideCompletedAndPersist,
  updateTodoListMoveCompletedToBottomAndPersist,
} from "./pageStateActions";

type TodoListsHandlerArgs = {
  lists: TodoList[];
  persist: PersistTodoLists;
};

export const createDeleteTodoListHandler = ({
  lists,
  persist,
  deleteListConfirmTemplate,
}: TodoListsHandlerArgs & {
  deleteListConfirmTemplate: (title: string) => string;
}) => {
  return (target: TodoList) => {
    deleteTodoListAndPersist({
      lists,
      list: target,
      message: deleteListConfirmTemplate(target.title),
      persist,
    });
  };
};

export const createUpdateListTitleHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, title: string) => {
    const normalized = normalizeTitle(title);
    if (!normalized) return;
    updateTodoListTitleAndPersist({
      lists,
      listId,
      title: normalized,
      persist,
    });
  };
};

export const createUpdateListAddItemPositionHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, position: "last" | "first") => {
    updateTodoListAddItemPositionAndPersist({ lists, listId, position, persist });
  };
};

export const createUpdateListMoveCompletedToBottomHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, moveCompletedToBottom: boolean) => {
    updateTodoListMoveCompletedToBottomAndPersist({
      lists,
      listId,
      moveCompletedToBottom,
      persist,
    });
  };
};

export const createUpdateListHideCompletedHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, hideCompleted: boolean) => {
    updateTodoListHideCompletedAndPersist({
      lists,
      listId,
      hideCompleted,
      persist,
    });
  };
};

export const createUpdateListGroupByCategoryHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, groupByCategory: boolean) => {
    updateTodoListGroupByCategoryAndPersist({
      lists,
      listId,
      groupByCategory,
      persist,
    });
  };
};
