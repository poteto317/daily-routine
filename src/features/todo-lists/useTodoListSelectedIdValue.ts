import { useTodoListEffectiveSelectedId } from "./useTodoListEffectiveSelectedId";
import { createTodoListSelectedIdValueResult } from "./todoListSelectedIdValueResult";
import { useTodoListSelectedIdStoreValue } from "./useTodoListSelectedIdStoreValue";

export const useTodoListSelectedIdValue = () => {
  const storeValue = useTodoListSelectedIdStoreValue();
  const effectiveSelectedId = useTodoListEffectiveSelectedId({
    selectedId: storeValue.selectedId,
  });

  return createTodoListSelectedIdValueResult({
    effectiveSelectedId: effectiveSelectedId.effectiveSelectedId,
    selectedId: storeValue.selectedId,
  });
};
