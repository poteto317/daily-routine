import type { useWeightTrackerFormVisibilityState } from "./useWeightTrackerFormVisibilityState";
import type { useWeightTrackerInputState } from "./useWeightTrackerInputState";

type WeightTrackerInputState = ReturnType<typeof useWeightTrackerInputState>;
type WeightTrackerFormVisibilityState = ReturnType<
  typeof useWeightTrackerFormVisibilityState
>;

type CreateWeightTrackerFormStateResultArgs = {
  inputState: WeightTrackerInputState;
  visibilityState: WeightTrackerFormVisibilityState;
  handleCancelForm: () => void;
};

export const createWeightTrackerFormStateResult = ({
  inputState,
  visibilityState,
  handleCancelForm,
}: CreateWeightTrackerFormStateResultArgs) => {
  return {
    ...inputState,
    ...visibilityState,
    handleCancelForm,
  };
};
