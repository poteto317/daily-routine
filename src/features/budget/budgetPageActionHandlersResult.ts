type BudgetPageActionHandlersResultArgs = {
  handleAddExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleSaveBudget: () => void;
};

export const createBudgetPageActionHandlersResult = ({
  handleAddExpense,
  handleDeleteExpense,
  handleSaveBudget,
}: BudgetPageActionHandlersResultArgs) => {
  return {
    handleAddExpense,
    handleDeleteExpense,
    handleSaveBudget,
  };
};
