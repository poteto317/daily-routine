type BudgetPageActionHandlersResultArgs = {
  handleAddExpense: () => void;
  handleUpdateExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
  handleSaveBudget: () => void;
};

export const createBudgetPageActionHandlersResult = ({
  handleAddExpense,
  handleUpdateExpense,
  handleDeleteExpense,
  handleSaveBudget,
}: BudgetPageActionHandlersResultArgs) => {
  return {
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleSaveBudget,
  };
};
