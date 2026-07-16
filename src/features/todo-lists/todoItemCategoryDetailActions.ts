import type { TodoList } from "./types";
import { updateItemCategoryInList } from "./todoItemCategoryHelpers";

export const updateTodoItemCategoryInLists = (params: {
  lists: TodoList[];
  listId: string;
  itemId: string;
  categoryId: string | undefined;
}): TodoList[] => {
  const { lists, listId, itemId, categoryId } = params;

  return updateItemCategoryInList(lists, listId, itemId, categoryId);
};
