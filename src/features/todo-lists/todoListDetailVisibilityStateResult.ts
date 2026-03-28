import type { Dispatch, SetStateAction } from "react";

type TodoListDetailVisibilityStateResultInput = {
  hideCompleted: boolean;
  setHideCompleted: Dispatch<SetStateAction<boolean>>;
};

export const createTodoListDetailVisibilityStateResult = ({
  hideCompleted,
  setHideCompleted,
}: TodoListDetailVisibilityStateResultInput) => ({
  hideCompleted,
  setHideCompleted,
});
