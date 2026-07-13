type BudgetExpenseActionsResultArgs = {
  handleAddExpense: () => void;
  handleUpdateExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
};

export const createBudgetExpenseActionsResult = ({
  handleAddExpense,
  handleUpdateExpense,
  handleDeleteExpense,
}: BudgetExpenseActionsResultArgs) => {
  return {
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
  };
};
