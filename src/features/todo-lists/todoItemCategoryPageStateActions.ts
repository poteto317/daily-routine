import type { PersistTodoLists, TodoList } from "./types";
import { updateTodoItemCategoryInLists } from "./todoItemCategoryDetailActions";

type UpdateTodoItemCategoryArgs = {
  lists: TodoList[];
  listId: string;
  itemId: string;
  categoryId: string | undefined;
  persist: PersistTodoLists;
};

export const updateTodoItemCategoryAndPersist = ({
  lists,
  listId,
  itemId,
  categoryId,
  persist,
}: UpdateTodoItemCategoryArgs): TodoList[] => {
  const nextLists = updateTodoItemCategoryInLists({
    lists,
    listId,
    itemId,
    categoryId,
  });
  persist(nextLists);
  return nextLists;
};
