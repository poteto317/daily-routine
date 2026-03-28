import { useSyncExternalStore } from "react";
import {
  getSelectedTodoListId,
  subscribeSelectedTodoListId,
} from "./selectedTodoList";
import { createTodoListSelectedIdStoreValueResult } from "./todoListSelectedIdStoreValueResult";

export const useTodoListSelectedIdStoreValue = () => {
  const selectedId = useSyncExternalStore(
    subscribeSelectedTodoListId,
    getSelectedTodoListId,
    () => null,
  );

  return createTodoListSelectedIdStoreValueResult({
    selectedId,
  });
};
