type WorkTrackerSessionActionsResultArgs = {
  handleCancelSession: () => void;
  handleDeleteSession: (sessionId: string) => void;
  handleSaveSession: () => void;
  resetForm: () => void;
};

export const createWorkTrackerSessionActionsResult = ({
  handleCancelSession,
  handleDeleteSession,
  handleSaveSession,
  resetForm,
}: WorkTrackerSessionActionsResultArgs) => {
  return {
    handleCancelSession,
    handleDeleteSession,
    handleSaveSession,
    resetForm,
  };
};
