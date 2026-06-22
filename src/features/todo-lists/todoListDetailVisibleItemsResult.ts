import type { TodoListItem } from "./types";

type TodoListDetailVisibleItemsResultInput = {
  filteredItems: TodoListItem[];
};

export const createTodoListDetailVisibleItemsResult = ({
  filteredItems,
}: TodoListDetailVisibleItemsResultInput) => ({
  filteredItems,
});
