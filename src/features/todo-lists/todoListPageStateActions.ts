import type { PersistTodoLists, TodoList } from "./types";
import { updateTodoListAddItemPositionInLists } from "./todoListDetailActions";

type UpdateTodoListAddItemPositionArgs = {
  lists: TodoList[];
  listId: string;
  position: "last" | "first";
  persist: PersistTodoLists;
};

export const updateTodoListAddItemPositionAndPersist = ({
  lists,
  listId,
  position,
  persist,
}: UpdateTodoListAddItemPositionArgs): TodoList[] => {
  const nextLists = updateTodoListAddItemPositionInLists({ lists, listId, position });
  persist(nextLists);
  return nextLists;
};
