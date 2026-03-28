import { createRoutineCrudFormStateResult } from "./routineCrudFormStateResult";
import { useRoutineCrudFormActions } from "./useRoutineCrudFormActions";
import { useRoutineCrudScrollRestoration } from "./useRoutineCrudScrollRestoration";
import { useRoutineCrudFormViewState } from "./useRoutineCrudFormViewState";

type UseRoutineCrudFormStateParams = {
  isEditMode: boolean;
};

export const useRoutineCrudFormState = ({
  isEditMode,
}: UseRoutineCrudFormStateParams) => {
  const viewState = useRoutineCrudFormViewState();
  const { restoreScroll, scrollRef } = useRoutineCrudScrollRestoration();
  const { closeForm, openForm } = useRoutineCrudFormActions({
    isEditMode,
    scrollRef,
    setEditingRoutine: viewState.setEditingRoutine,
    setShowForm: viewState.setShowForm,
  });

  return createRoutineCrudFormStateResult({
    restoreScroll,
    viewState,
    actions: {
      closeForm,
      openForm,
    },
  });
};
