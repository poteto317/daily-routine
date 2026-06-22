import type { Dispatch, SetStateAction } from "react";

type TodoListMoveCompletedToBottomStateResultInput = {
  moveCompletedToBottom: boolean;
  setMoveCompletedToBottom: Dispatch<SetStateAction<boolean>>;
};

export const createTodoListMoveCompletedToBottomStateResult = ({
  moveCompletedToBottom,
  setMoveCompletedToBottom,
}: TodoListMoveCompletedToBottomStateResultInput) => ({
  moveCompletedToBottom,
  setMoveCompletedToBottom,
});
