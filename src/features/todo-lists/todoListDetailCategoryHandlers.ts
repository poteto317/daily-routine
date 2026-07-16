import type { PersistTodoLists, TodoList } from "./types";
import { updateTodoItemCategoryAndPersist } from "./todoItemCategoryPageStateActions";

type TodoListsHandlerArgs = {
  lists: TodoList[];
  persist: PersistTodoLists;
};

export const createUpdateTodoItemCategoryHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, itemId: string, categoryId: string | undefined) => {
    updateTodoItemCategoryAndPersist({
      lists,
      listId,
      itemId,
      categoryId,
      persist,
    });
  };
};
