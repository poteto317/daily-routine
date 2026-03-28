import type { WeightRecord } from "@/types/routine";
import { resetWeightFormInputs } from "./pageStateActions";
import { useWeightTrackerFormActions } from "./useWeightTrackerFormActions";
import { useWeightTrackerFormVisibilityState } from "./useWeightTrackerFormVisibilityState";
import { useWeightTrackerInputState } from "./useWeightTrackerInputState";
import { createWeightTrackerFormStateResult } from "./weightTrackerFormStateResult";

type UseWeightTrackerFormStateParams = {
  initialTodayRecord: WeightRecord | null;
  initialShowForm?: boolean;
  getTodayWeightRecord: () => WeightRecord | null;
};

export const useWeightTrackerFormState = ({
  initialTodayRecord,
  initialShowForm = false,
  getTodayWeightRecord,
}: UseWeightTrackerFormStateParams) => {
  const initialFormState = resetWeightFormInputs(initialTodayRecord);
  const inputState = useWeightTrackerInputState({
    initialWeightInput: initialFormState.weightInput,
    initialNotesInput: initialFormState.notesInput,
  });
  const visibilityState = useWeightTrackerFormVisibilityState({
    initialShowForm,
  });
  const { handleCancelForm } = useWeightTrackerFormActions({
    getTodayWeightRecord,
    setWeightInput: inputState.setWeightInput,
    setNotesInput: inputState.setNotesInput,
    setShowForm: visibilityState.setShowForm,
  });

  return createWeightTrackerFormStateResult({
    inputState,
    visibilityState,
    handleCancelForm,
  });
};
