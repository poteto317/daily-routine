import { useState } from "react";
import { createTodoListMoveCompletedToBottomStateResult } from "./todoListMoveCompletedToBottomStateResult";

export const useTodoListMoveCompletedToBottomState = () => {
  const [moveCompletedToBottom, setMoveCompletedToBottom] = useState(false);

  return createTodoListMoveCompletedToBottomStateResult({
    moveCompletedToBottom,
    setMoveCompletedToBottom,
  });
};
