import type { Dispatch, SetStateAction } from "react";
import {
  createCancelMealFormAction,
  createOpenMealFormAction,
  createResetMealFormAction,
} from "./mealPageStateActions";

type UseMealPageFormActionsArgs = {
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setDescriptionInput: Dispatch<SetStateAction<string>>;
  setNotesInput: Dispatch<SetStateAction<string>>;
};

export const useMealPageFormActions = ({
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: UseMealPageFormActionsArgs) => {
  return {
    handleCancelForm: createCancelMealFormAction({
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    }),
    openForm: createOpenMealFormAction({ setShowForm }),
    resetForm: createResetMealFormAction({
      setDescriptionInput,
      setNotesInput,
    }),
  };
};
