import { useTodoListSelectedIdSync } from "./useTodoListSelectedIdSync";
import { useTodoListSelectedIdValue } from "./useTodoListSelectedIdValue";
import { createTodoListSelectionStateResult } from "./todoListSelectionStateResult";

export const useTodoListSelectionState = () => {
  const { effectiveSelectedId, selectedId } = useTodoListSelectedIdValue();
  useTodoListSelectedIdSync({ effectiveSelectedId, selectedId });

  return createTodoListSelectionStateResult({
    effectiveSelectedId,
  });
};
