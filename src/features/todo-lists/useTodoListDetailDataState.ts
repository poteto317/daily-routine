import { getTodoLists } from "./storage";
import { findTodoListById } from "./selectors";
import { useTodoListHistory } from "./useTodoListHistory";
import { saveTodoListsToLocal } from "./sync";

export const useTodoListDetailDataState = (listId: string) => {
  const { lists, persist, undo, redo, canUndo, canRedo } =
    useTodoListHistory({ getInitialLists: getTodoLists, saveLists: saveTodoListsToLocal });

  const list = findTodoListById(lists, listId);

  return {
    list,
    lists,
    persist,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
