import { useHomeViewControlInitialState } from "./useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "./useHomeViewControlRuntimeState";

export const useHomeViewControlState = () => {
  const initialState = useHomeViewControlInitialState();

  return useHomeViewControlRuntimeState(initialState);
};
