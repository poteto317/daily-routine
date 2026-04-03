import { useMemo, type Dispatch, type SetStateAction } from "react";
import { createCollapseToggleHandler } from "./todoListCollapseToggleHandler";
import { createTodoListCollapseActionsResult } from "./todoListCollapseActionsResult";

type UseTodoListCollapseItemActionsParams = {
  setCollapsedItemIds: Dispatch<SetStateAction<Set<string>>>;
};

export const useTodoListCollapseItemActions = ({
  setCollapsedItemIds,
}: UseTodoListCollapseItemActionsParams) => {
  const toggleCollapseItem = useMemo(
    () => createCollapseToggleHandler(setCollapsedItemIds),
    [setCollapsedItemIds],
  );

  return createTodoListCollapseActionsResult({ toggleCollapseItem });
};
