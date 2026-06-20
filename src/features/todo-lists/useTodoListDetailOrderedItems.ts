import { useMemo } from "react";
import { sortCompletedToBottom } from "./todoListCompletedToBottomSort";
import { createTodoListDetailOrderedItemsResult } from "./todoListDetailOrderedItemsResult";
import type { TodoListItem } from "./types";

type UseTodoListDetailOrderedItemsParams = {
  filteredItems: TodoListItem[];
  moveCompletedToBottom: boolean;
};

export const useTodoListDetailOrderedItems = ({
  filteredItems,
  moveCompletedToBottom,
}: UseTodoListDetailOrderedItemsParams) => {
  const orderedItems = useMemo(
    () =>
      moveCompletedToBottom ? sortCompletedToBottom(filteredItems) : filteredItems,
    [filteredItems, moveCompletedToBottom],
  );

  return createTodoListDetailOrderedItemsResult({ visibleItems: orderedItems });
};
