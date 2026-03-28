import type { Dispatch, SetStateAction } from "react";
import { createCancelWeightFormHandler } from "./weightPageStateActions";

type UseWeightTrackerFormActionsParams = {
  getTodayWeightRecord: () => import("@/types/routine").WeightRecord | null;
  setWeightInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useWeightTrackerFormActions = ({
  getTodayWeightRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
}: UseWeightTrackerFormActionsParams) => {
  return {
    handleCancelForm: createCancelWeightFormHandler({
      getTodayWeightRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
    }),
  };
};
