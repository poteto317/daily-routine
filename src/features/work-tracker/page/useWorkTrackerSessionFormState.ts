import type { createInitialWorkTrackerPageState } from "./viewStateActions";
import { useWorkTrackerSessionInputState } from "./useWorkTrackerSessionInputState";
import { useWorkTrackerSessionVisibilityState } from "./useWorkTrackerSessionVisibilityState";
import { createWorkTrackerSessionFormStateResult } from "./workTrackerSessionFormStateResult";

type InitialWorkTrackerFormState = Pick<
  ReturnType<typeof createInitialWorkTrackerPageState>,
  | "showInputForm"
  | "showTemplateDropdown"
  | "workName"
  | "notes"
  | "selectedMood"
  | "selectedTemplate"
>;

type UseWorkTrackerSessionFormStateParams = {
  initialState: InitialWorkTrackerFormState;
};

export const useWorkTrackerSessionFormState = ({
  initialState,
}: UseWorkTrackerSessionFormStateParams) => {
  const visibilityState = useWorkTrackerSessionVisibilityState({
    initialShowInputForm: initialState.showInputForm,
    initialShowTemplateDropdown: initialState.showTemplateDropdown,
  });
  const inputState = useWorkTrackerSessionInputState({
    initialWorkName: initialState.workName,
    initialNotes: initialState.notes,
    initialSelectedMood: initialState.selectedMood,
    initialSelectedTemplate: initialState.selectedTemplate,
  });

  return createWorkTrackerSessionFormStateResult({
    ...visibilityState,
    ...inputState,
  });
};
