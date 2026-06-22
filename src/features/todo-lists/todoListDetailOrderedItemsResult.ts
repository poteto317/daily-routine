import type { TodoListItem } from "./types";

type TodoListDetailOrderedItemsResultInput = {
  visibleItems: TodoListItem[];
};

export const createTodoListDetailOrderedItemsResult = ({
  visibleItems,
}: TodoListDetailOrderedItemsResultInput) => ({
  visibleItems,
});
