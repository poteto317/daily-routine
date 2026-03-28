import type { TodoListItem } from "./types";

type TodoListDetailComputedValuesResultInput = {
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  visibleItems: TodoListItem[];
};

export const createTodoListDetailComputedValuesResult = ({
  progress,
  visibleItems,
}: TodoListDetailComputedValuesResultInput) => ({
  progress,
  visibleItems,
});
