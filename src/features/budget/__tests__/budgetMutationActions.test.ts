import {
  createBudgetSaveHandler,
  createExpenseAddHandler,
  createExpenseDeleteHandler,
} from "../budgetMutationActions";

jest.mock("../budgetPageStateHelpers", () => ({
  getMonthStateSnapshot: jest.fn(),
}));

jest.mock("../budgetPageStateLogic", () => ({
  buildBudgetSavePayload: jest.fn(),
  buildExpensePayload: jest.fn(),
}));

jest.mock("../stateActions", () => ({
  addExpenseFromInput: jest.fn(),
  deleteExpenseAndRefresh: jest.fn(),
  saveBudgetFromInput: jest.fn(),
}));

jest.mock("../storage", () => ({
  addExpense: jest.fn(),
  deleteExpense: jest.fn(),
  setMonthlyBudget: jest.fn(),
}));

import { getMonthStateSnapshot } from "../budgetPageStateHelpers";
import {
  buildBudgetSavePayload,
  buildExpensePayload,
} from "../budgetPageStateLogic";
import {
  addExpenseFromInput,
  deleteExpenseAndRefresh,
  saveBudgetFromInput,
} from "../stateActions";
import { addExpense, deleteExpense, setMonthlyBudget } from "../storage";

describe("budgetMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("予算保存 handler が保存 action を構築する", () => {
    const setMonthBudget = jest.fn();
    const closeBudgetInput = jest.fn();

    createBudgetSaveHandler({
      currentMonth: "2026-03",
      budgetInputValue: "45000",
      setMonthBudget,
      closeBudgetInput,
    })();

    expect(saveBudgetFromInput).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      budgetInputValue: "45000",
      buildPayload: buildBudgetSavePayload,
      saveBudget: setMonthlyBudget,
      setMonthBudget,
      closeBudgetInput,
    });
  });

  it("支出追加 handler が追加 action を構築する", () => {
    const setExpenses = jest.fn();
    const closeExpenseForm = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");

    createExpenseAddHandler({
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      currentDate,
      setExpenses,
      closeExpenseForm,
    })();

    expect(addExpenseFromInput).toHaveBeenCalledWith({
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      buildPayload: buildExpensePayload,
      saveExpense: addExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      closeExpenseForm,
    });
  });

  it("削除 handler を構築する", () => {
    const setExpenses = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");

    createExpenseDeleteHandler({
      currentMonth: "2026-03",
      currentDate,
      setExpenses,
    })("e-mar");

    expect(deleteExpenseAndRefresh).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      expenseId: "e-mar",
      deleteExpense,
      currentDate,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
    });
  });
});
