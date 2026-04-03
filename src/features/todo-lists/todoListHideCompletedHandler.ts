import type { Dispatch, SetStateAction } from "react";

export const createCompletedVisibilityToggleHandler = (
  setHideCompleted: Dispatch<SetStateAction<boolean>>,
) => {
  return () => {
    setHideCompleted((value) => !value);
  };
};
