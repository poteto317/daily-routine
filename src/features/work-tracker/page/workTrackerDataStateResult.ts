type SessionsState = ReturnType<
  typeof import("./useWorkTrackerSessionsState").useWorkTrackerSessionsState
>;
type TemplatesState = ReturnType<
  typeof import("./useWorkTrackerTemplatesState").useWorkTrackerTemplatesState
>;
type InitialState = ReturnType<
  typeof import("./useWorkTrackerInitialState").useWorkTrackerInitialState
>;

type CreateWorkTrackerDataStateResultArgs = {
  sessionsState: SessionsState;
  templatesState: TemplatesState;
  initialState: InitialState;
};

export const createWorkTrackerDataStateResult = ({
  sessionsState,
  templatesState,
  initialState,
}: CreateWorkTrackerDataStateResultArgs) => ({
  initialState,
  sessions: sessionsState.sessions,
  setSessions: sessionsState.setSessions,
  templates: templatesState.templates,
  setTemplates: templatesState.setTemplates,
});
