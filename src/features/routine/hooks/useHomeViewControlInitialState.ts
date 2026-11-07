import { useState } from "react";
import { createInitialHomeViewControlState } from "./homeViewControlStateActions";

export const useHomeViewControlInitialState = () => {
  const [initialState] = useState(createInitialHomeViewControlState);

  return initialState;
};
