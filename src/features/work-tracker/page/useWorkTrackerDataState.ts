import { useWorkTrackerSessionsState } from "./useWorkTrackerSessionsState";
import { useWorkTrackerTemplatesState } from "./useWorkTrackerTemplatesState";
import { useWorkTrackerInitialState } from "./useWorkTrackerInitialState";
import { createWorkTrackerDataStateResult } from "./workTrackerDataStateResult";

export const useWorkTrackerDataState = () => {
  const sessionsState = useWorkTrackerSessionsState();
  const templatesState = useWorkTrackerTemplatesState();
  const initialState = useWorkTrackerInitialState({
    sessions: sessionsState.sessions,
    templates: templatesState.templates,
  });

  return createWorkTrackerDataStateResult({
    sessionsState,
    templatesState,
    initialState,
  });
};
