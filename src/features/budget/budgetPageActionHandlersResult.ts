type BudgetPageActionHandlersResultArgs = {
  handleAddExpense: () => void;
  handleUpdateExpense: () => void;
  handleDeleteExpense: (expenseId: string) => void;
};

export const createBudgetPageActionHandlersResult = ({
  handleAddExpense,
  handleUpdateExpense,
  handleDeleteExpense,
}: BudgetPageActionHandlersResultArgs) => {
  return {
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
  };
};
