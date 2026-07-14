type CreateBudgetPageInputHandlersParams = {
  setBudgetInputValue: (value: string) => void;
  setExpenseAmount: (value: string) => void;
  setExpenseDate: (value: string) => void;
  setExpenseCategoryId: (value: string) => void;
  setEditingExpenseAmount: (value: string) => void;
  setEditingExpenseDate: (value: string) => void;
  setEditingExpenseCategoryId: (value: string) => void;
};

export const createBudgetPageInputHandlers = ({
  setBudgetInputValue,
  setExpenseAmount,
  setExpenseDate,
  setExpenseCategoryId,
  setEditingExpenseAmount,
  setEditingExpenseDate,
  setEditingExpenseCategoryId,
}: CreateBudgetPageInputHandlersParams) => {
  return {
    handleBudgetInputChange: (value: string) => setBudgetInputValue(value),
    handleExpenseAmountChange: (value: string) => setExpenseAmount(value),
    handleExpenseDateChange: (value: string) => setExpenseDate(value),
    handleExpenseCategoryIdChange: (value: string) =>
      setExpenseCategoryId(value),
    handleEditExpenseAmountChange: (value: string) =>
      setEditingExpenseAmount(value),
    handleEditExpenseDateChange: (value: string) =>
      setEditingExpenseDate(value),
    handleEditExpenseCategoryIdChange: (value: string) =>
      setEditingExpenseCategoryId(value),
  };
};
