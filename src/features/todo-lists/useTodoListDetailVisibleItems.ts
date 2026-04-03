import { useMemo } from "react";
import { createTodoListDetailVisibleItemsResult } from "./todoListDetailVisibleItemsResult";
import { getVisibleTodoItems } from "./todoListItemVisibilityFilter";
import type { TodoList } from "./types";

type UseTodoListDetailVisibleItemsParams = {
  hideCompleted: boolean;
  collapsedItemIds: ReadonlySet<string>;
  list: TodoList;
};

export const useTodoListDetailVisibleItems = ({
  hideCompleted,
  collapsedItemIds,
  list,
}: UseTodoListDetailVisibleItemsParams) => {
  const visibleItems = useMemo(
    () => getVisibleTodoItems(list.items, hideCompleted, collapsedItemIds),
    [hideCompleted, collapsedItemIds, list.items],
  );

  return createTodoListDetailVisibleItemsResult({ visibleItems });
};
