import { useWorkTrackerSessionFormState } from "./useWorkTrackerSessionFormState";
import { useWorkTrackerRunState } from "./useWorkTrackerRunState";
import { useWorkTrackerSessionActions } from "./useWorkTrackerSessionActions";
import { useWorkTrackerDataState } from "./useWorkTrackerDataState";
import { createWorkTrackerPageActionBindings } from "./workTrackerPageActionBindings";
import { createWorkTrackerPageStateResult } from "./workTrackerPageStateResult";

export const useWorkTrackerPageState = () => {
  const { initialState, sessions, setSessions, templates, setTemplates } =
    useWorkTrackerDataState();

  const {
    notes,
    selectedMood,
    selectedTemplate,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setShowInputForm,
    setShowTemplateDropdown,
    setWorkName,
    showInputForm,
    showTemplateDropdown,
    workName,
  } = useWorkTrackerSessionFormState({
    initialState,
  });
  const {
    clearStartTime,
    elapsedTime,
    getStartTime,
    isRunning,
    setElapsedTime,
    startTimer,
    stopTimer,
  } = useWorkTrackerRunState({
    initialIsRunning: initialState.isRunning,
    initialElapsedTime: initialState.elapsedTime,
    setShowInputForm,
  });
  const { handleCancelSession, handleDeleteSession, handleSaveSession } =
    useWorkTrackerSessionActions(
      createWorkTrackerPageActionBindings({
        workName,
        selectedMood,
        elapsedTime,
        notes,
        getStartTime,
        setSessions,
        setTemplates,
        setWorkName,
        setNotes,
        setSelectedMood,
        setSelectedTemplate,
        setElapsedTime,
        setShowInputForm,
        setShowTemplateDropdown,
        clearStartTime,
      }),
    );

  return createWorkTrackerPageStateResult({
    sessions,
    templates,
    isRunning,
    elapsedTime,
    showInputForm,
    showTemplateDropdown,
    workName,
    notes,
    selectedMood,
    selectedTemplate,
    setWorkName,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setShowTemplateDropdown,
    setShowInputForm,
    startTimer,
    stopTimer,
    handleSaveSession,
    handleCancelSession,
    handleDeleteSession,
  });
};
