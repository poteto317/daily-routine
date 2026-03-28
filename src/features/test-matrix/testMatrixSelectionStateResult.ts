type TestMatrixSelectionStateResultInput = {
  selectedItemId: string | null;
  setSelectedItemId: (value: string | null) => void;
};

export const createTestMatrixSelectionStateResult = ({
  selectedItemId,
  setSelectedItemId,
}: TestMatrixSelectionStateResultInput) => ({
  selectedItemId,
  setSelectedItemId,
});
