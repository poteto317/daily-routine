import { useState } from "react";
import { createTodoListDetailVisibilityStateResult } from "./todoListDetailVisibilityStateResult";

export const useTodoListDetailVisibilityState = () => {
  const [hideCompleted, setHideCompleted] = useState(false);

  return createTodoListDetailVisibilityStateResult({
    hideCompleted,
    setHideCompleted,
  });
};
