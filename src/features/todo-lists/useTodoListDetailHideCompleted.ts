import type { TodoList } from "./types";
import { createTodoListDetailHideCompletedResult } from "./todoListDetailHideCompletedResult";

type UseTodoListDetailHideCompletedParams = {
  list: TodoList;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailHideCompleted = ({
  list,
  onUpdateListHideCompleted,
}: UseTodoListDetailHideCompletedParams) => {
  const hideCompleted = list.hideCompleted ?? false;
  const toggleHideCompleted = () =>
    onUpdateListHideCompleted(list.id, !hideCompleted);

  return createTodoListDetailHideCompletedResult({
    hideCompleted,
    toggleHideCompleted,
  });
};
