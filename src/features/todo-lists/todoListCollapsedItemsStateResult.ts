import type { Dispatch, SetStateAction } from "react";

type TodoListCollapsedItemsStateResultInput = {
  collapsedItemIds: Set<string>;
  setCollapsedItemIds: Dispatch<SetStateAction<Set<string>>>;
};

export const createTodoListCollapsedItemsStateResult = ({
  collapsedItemIds,
  setCollapsedItemIds,
}: TodoListCollapsedItemsStateResultInput) => ({
  collapsedItemIds,
  setCollapsedItemIds,
});
