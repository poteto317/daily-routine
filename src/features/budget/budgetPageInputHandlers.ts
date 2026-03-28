type CreateBudgetPageInputHandlersParams = {
  setBudgetInputValue: (value: string) => void;
  setExpenseAmount: (value: string) => void;
  setExpenseDate: (value: string) => void;
  setExpenseDescription: (value: string) => void;
};

export const createBudgetPageInputHandlers = ({
  setBudgetInputValue,
  setExpenseAmount,
  setExpenseDate,
  setExpenseDescription,
}: CreateBudgetPageInputHandlersParams) => {
  return {
    handleBudgetInputChange: (value: string) => setBudgetInputValue(value),
    handleExpenseAmountChange: (value: string) => setExpenseAmount(value),
    handleExpenseDateChange: (value: string) => setExpenseDate(value),
    handleExpenseDescriptionChange: (value: string) =>
      setExpenseDescription(value),
  };
};
