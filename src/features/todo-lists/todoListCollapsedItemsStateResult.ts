import type { Dispatch, SetStateAction } from "react";

type TodoListCollapsedItemsStateResult = {
  collapsedItemIds: ReadonlySet<string>;
  setCollapsedItemIds: Dispatch<SetStateAction<Set<string>>>;
};

type TodoListCollapsedItemsStateResultInput = {
  collapsedItemIds: ReadonlySet<string>;
  setCollapsedItemIds: Dispatch<SetStateAction<Set<string>>>;
};

export const createTodoListCollapsedItemsStateResult = ({
  collapsedItemIds,
  setCollapsedItemIds,
}: TodoListCollapsedItemsStateResultInput): TodoListCollapsedItemsStateResult => ({
  collapsedItemIds,
  setCollapsedItemIds,
});
