import { useState } from "react";
import { createTodoListCollapsedItemsStateResult } from "./todoListCollapsedItemsStateResult";

export const useTodoListCollapsedItemsState = () => {
  const [collapsedItemIds, setCollapsedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  return createTodoListCollapsedItemsStateResult({
    collapsedItemIds,
    setCollapsedItemIds,
  });
};
