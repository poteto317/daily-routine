import { useEffect } from "react";
import { syncSelectedTodoListIdIfNeeded } from "./pageStateActions";
import { setSelectedTodoListId } from "./selectedTodoList";

type UseTodoListSelectedIdSyncParams = {
  effectiveSelectedId: string | null;
  selectedId: string | null;
};

export const useTodoListSelectedIdSync = ({
  effectiveSelectedId,
  selectedId,
}: UseTodoListSelectedIdSyncParams) => {
  useEffect(() => {
    syncSelectedTodoListIdIfNeeded(
      effectiveSelectedId,
      selectedId,
      setSelectedTodoListId,
    );
  }, [effectiveSelectedId, selectedId]);
};
