import type { Dispatch, SetStateAction } from "react";
import type { TodoList } from "./types";
import { persistTodoLists } from "./todoListPersistence";
import { saveTodoListsToLocal } from "./sync";

type PersistTodoListsActionArgs = {
  setLists: Dispatch<SetStateAction<TodoList[]>>;
};

export const createPersistTodoListsAction = ({
  setLists,
}: PersistTodoListsActionArgs) => {
  return (next: TodoList[]) => {
    persistTodoLists({
      nextLists: next,
      setLists,
      saveLists: saveTodoListsToLocal,
    });
  };
};
