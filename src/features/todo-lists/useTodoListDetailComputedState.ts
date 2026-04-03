import type { TodoList } from "./types";
import { createTodoListDetailComputedStateResult } from "./todoListDetailComputedStateResult";
import { useTodoListDetailProgress } from "./useTodoListDetailProgress";
import { useTodoListDetailVisibleItems } from "./useTodoListDetailVisibleItems";
import { useTodoListDetailVisibility } from "./useTodoListDetailVisibility";

type UseTodoListDetailComputedStateParams = {
  list: TodoList;
};

export const useTodoListDetailComputedState = ({
  list,
}: UseTodoListDetailComputedStateParams) => {
  const detailVisibility = useTodoListDetailVisibility();
  const detailProgress = useTodoListDetailProgress({ list });
  const detailVisibleItems = useTodoListDetailVisibleItems({
    hideCompleted: detailVisibility.hideCompleted,
    collapsedItemIds: detailVisibility.collapsedItemIds,
    list,
  });

  return createTodoListDetailComputedStateResult({
    detailProgress,
    detailVisibleItems,
    detailVisibility,
  });
};
