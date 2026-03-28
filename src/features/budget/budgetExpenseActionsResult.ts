type BudgetExpenseActionsResultArgs = {
  handleAddExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
};

export const createBudgetExpenseActionsResult = ({
  handleAddExpense,
  handleDeleteExpense,
}: BudgetExpenseActionsResultArgs) => {
  return {
    handleAddExpense,
    handleDeleteExpense,
  };
};
