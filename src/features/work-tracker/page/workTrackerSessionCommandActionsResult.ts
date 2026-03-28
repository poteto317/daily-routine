type WorkTrackerSessionCommandActionsResultArgs = {
  handleCancelSession: () => void;
  handleDeleteSession: (sessionId: string) => void;
  handleSaveSession: () => void;
};

export const createWorkTrackerSessionCommandActionsResult = ({
  handleCancelSession,
  handleDeleteSession,
  handleSaveSession,
}: WorkTrackerSessionCommandActionsResultArgs) => {
  return {
    handleCancelSession,
    handleDeleteSession,
    handleSaveSession,
  };
};
