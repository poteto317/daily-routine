import type { TodoListItem } from "./types";

type TodoListDetailVisibleItemsResultInput = {
  visibleItems: TodoListItem[];
};

export const createTodoListDetailVisibleItemsResult = ({
  visibleItems,
}: TodoListDetailVisibleItemsResultInput) => ({
  visibleItems,
});
