import { getTodoLists } from "./storage";
import { resolveSelectedTodoListId } from "./selectors";
import { createTodoListEffectiveSelectedIdResult } from "./todoListEffectiveSelectedIdResult";

type UseTodoListEffectiveSelectedIdParams = {
  selectedId: string | null;
};

export const useTodoListEffectiveSelectedId = ({
  selectedId,
}: UseTodoListEffectiveSelectedIdParams) => {
  return createTodoListEffectiveSelectedIdResult({
    effectiveSelectedId: resolveSelectedTodoListId(getTodoLists(), selectedId),
  });
};
