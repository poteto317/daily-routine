import { useState } from "react";
import { createTodoListHideCompletedStateResult } from "./todoListHideCompletedStateResult";

export const useTodoListHideCompletedState = () => {
  const [hideCompleted, setHideCompleted] = useState(false);

  return createTodoListHideCompletedStateResult({
    hideCompleted,
    setHideCompleted,
  });
};
