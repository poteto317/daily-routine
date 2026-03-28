type TestMatrixDataActionsResultArgs = {
  resetAll: () => boolean;
  toggleDetailStatus: (caseId: string, field: "pc" | "sp") => void;
  toggleStatus: (catId: string, itemId: string, field: "pc" | "sp") => void;
  updateDetailNote: (caseId: string, note: string) => void;
  updateNote: (catId: string, itemId: string, note: string) => void;
};

export const createTestMatrixDataActionsResult = ({
  resetAll,
  toggleDetailStatus,
  toggleStatus,
  updateDetailNote,
  updateNote,
}: TestMatrixDataActionsResultArgs) => {
  return {
    resetAll,
    toggleDetailStatus,
    toggleStatus,
    updateDetailNote,
    updateNote,
  };
};
