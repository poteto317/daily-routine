type BudgetSaveActionResultArgs = {
  handleSaveBudget: () => void;
};

export const createBudgetSaveActionResult = ({
  handleSaveBudget,
}: BudgetSaveActionResultArgs) => {
  return { handleSaveBudget };
};
