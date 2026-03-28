import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  closeRoutineCrudFormState,
  openRoutineCrudFormState,
} from "./routineCrudViewStateActions";

type UseRoutineCrudFormActionsParams = {
  isEditMode: boolean;
  scrollRef: MutableRefObject<number>;
  setEditingRoutine: Dispatch<SetStateAction<Routine | undefined>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};

export const useRoutineCrudFormActions = ({
  isEditMode,
  scrollRef,
  setEditingRoutine,
  setShowForm,
}: UseRoutineCrudFormActionsParams) => {
  return {
    closeForm: () => {
      closeRoutineCrudFormState({ setShowForm, setEditingRoutine });
    },
    openForm: (routine?: Routine) => {
      return openRoutineCrudFormState({
        isEditMode,
        routine,
        scrollTop: window.scrollY || document.documentElement.scrollTop,
        scrollRef,
        setEditingRoutine,
        setShowForm,
      });
    },
  };
};
