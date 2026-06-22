import type { Dispatch, SetStateAction } from "react";

export const createMoveCompletedToBottomToggleHandler = (
  setMoveCompletedToBottom: Dispatch<SetStateAction<boolean>>,
) => {
  return () => {
    setMoveCompletedToBottom((value) => !value);
  };
};
