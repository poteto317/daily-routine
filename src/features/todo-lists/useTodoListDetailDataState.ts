import { useState } from "react";
import type { TodoList } from "./types";
import { getTodoLists } from "./storage";
import { findTodoListById } from "./selectors";
import { createPersistTodoListsAction } from "./todoListDetailPersistActions";

export const useTodoListDetailDataState = (listId: string) => {
  const [lists, setLists] = useState<TodoList[]>(() => getTodoLists());

  const persist = createPersistTodoListsAction({
    setLists,
  });

  const list = findTodoListById(lists, listId);

  return {
    list,
    lists,
    persist,
  };
};
