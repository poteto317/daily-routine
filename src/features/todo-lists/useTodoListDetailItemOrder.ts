import type { TodoList } from "./types";
import { createTodoListDetailItemOrderResult } from "./todoListDetailItemOrderResult";

type UseTodoListDetailItemOrderParams = {
  list: TodoList;
  onUpdateListMoveCompletedToBottom: (
    listId: string,
    moveCompletedToBottom: boolean,
  ) => void;
};

export const useTodoListDetailItemOrder = ({
  list,
  onUpdateListMoveCompletedToBottom,
}: UseTodoListDetailItemOrderParams) => {
  const moveCompletedToBottom = list.moveCompletedToBottom ?? false;
  const toggleMoveCompletedToBottom = () =>
    onUpdateListMoveCompletedToBottom(list.id, !moveCompletedToBottom);

  return createTodoListDetailItemOrderResult({
    moveCompletedToBottom,
    toggleMoveCompletedToBottom,
  });
};
