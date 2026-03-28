import { useMemo } from "react";
import { getListProgress } from "./helpers";
import { getVisibleTodoItems } from "./selectors";
import { createTodoListDetailComputedValuesResult } from "./todoListDetailComputedValuesResult";
import type { TodoList } from "./types";

type UseTodoListDetailComputedValuesParams = {
  hideCompleted: boolean;
  list: TodoList;
};

export const useTodoListDetailComputedValues = ({
  hideCompleted,
  list,
}: UseTodoListDetailComputedValuesParams) => {
  const progress = useMemo(() => getListProgress(list), [list]);
  const visibleItems = useMemo(
    () => getVisibleTodoItems(list.items, hideCompleted),
    [hideCompleted, list.items],
  );

  return createTodoListDetailComputedValuesResult({
    progress,
    visibleItems,
  });
};
