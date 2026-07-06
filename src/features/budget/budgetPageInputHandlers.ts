type CreateBudgetPageInputHandlersParams = {
  setBudgetInputValue: (value: string) => void;
  setExpenseAmount: (value: string) => void;
  setExpenseDate: (value: string) => void;
  setExpenseCategoryId: (value: string) => void;
};

export const createBudgetPageInputHandlers = ({
  setBudgetInputValue,
  setExpenseAmount,
  setExpenseDate,
  setExpenseCategoryId,
}: CreateBudgetPageInputHandlersParams) => {
  return {
    handleBudgetInputChange: (value: string) => setBudgetInputValue(value),
    handleExpenseAmountChange: (value: string) => setExpenseAmount(value),
    handleExpenseDateChange: (value: string) => setExpenseDate(value),
    handleExpenseCategoryIdChange: (value: string) =>
      setExpenseCategoryId(value),
  };
};
