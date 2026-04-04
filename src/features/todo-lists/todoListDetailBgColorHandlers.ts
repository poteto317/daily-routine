import type { PersistTodoLists, TodoItemBgColorValue, TodoList } from "./types";
import {
  updateAllTodoItemsBgColorAndPersist,
  updateTodoItemBgColorAndPersist,
} from "./todoItemBgColorPageStateActions";

type TodoListsHandlerArgs = {
  lists: TodoList[];
  persist: PersistTodoLists;
};

export const createUpdateTodoItemBgColorHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string, bgColor: TodoItemBgColorValue) => {
    updateTodoItemBgColorAndPersist({
      lists,
      listId,
      itemId,
      bgColor,
      persist,
    });
  };
};

export const createUpdateAllTodoItemsBgColorHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, bgColor: TodoItemBgColorValue) => {
    updateAllTodoItemsBgColorAndPersist({ lists, listId, bgColor, persist });
  };
};
