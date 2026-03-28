import type { useRoutineCrudFormActions } from "./useRoutineCrudFormActions";
import type { useRoutineCrudFormViewState } from "./useRoutineCrudFormViewState";

type RoutineCrudFormStateResultArgs = {
  restoreScroll: () => void;
  viewState: ReturnType<typeof useRoutineCrudFormViewState>;
  actions: ReturnType<typeof useRoutineCrudFormActions>;
};

export const createRoutineCrudFormStateResult = ({
  restoreScroll,
  viewState,
  actions,
}: RoutineCrudFormStateResultArgs) => {
  return {
    showForm: viewState.showForm,
    editingRoutine: viewState.editingRoutine,
    closeForm: actions.closeForm,
    openForm: actions.openForm,
    restoreScroll,
  };
};
