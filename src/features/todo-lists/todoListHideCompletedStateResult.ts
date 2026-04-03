import type { Dispatch, SetStateAction } from "react";

type TodoListHideCompletedStateResultInput = {
  hideCompleted: boolean;
  setHideCompleted: Dispatch<SetStateAction<boolean>>;
};

export const createTodoListHideCompletedStateResult = ({
  hideCompleted,
  setHideCompleted,
}: TodoListHideCompletedStateResultInput) => ({
  hideCompleted,
  setHideCompleted,
});
