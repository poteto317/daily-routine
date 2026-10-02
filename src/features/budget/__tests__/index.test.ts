import * as budgetModule from "../index";

describe("budget index exports", () => {
  it("pages and storage functions are exported", () => {
    expect(budgetModule.BudgetPage).toBeDefined();
    expect(budgetModule.BudgetCategoryManagementPage).toBeDefined();
    expect(budgetModule.BudgetAllowanceSettingsPage).toBeDefined();
    expect(budgetModule.BudgetSummaryPage).toBeDefined();
    expect(budgetModule.getBudgetData).toBeDefined();
    expect(budgetModule.saveBudgetData).toBeDefined();
    expect(budgetModule.getMonthlyExpenses).toBeDefined();
    expect(budgetModule.addExpense).toBeDefined();
    expect(budgetModule.updateExpense).toBeDefined();
    expect(budgetModule.deleteExpense).toBeDefined();
    expect(budgetModule.getMonthlyTotalExpense).toBeDefined();
    expect(budgetModule.getBudgetCategories).toBeDefined();
    expect(budgetModule.saveBudgetCategories).toBeDefined();
    expect(budgetModule.getBudgetIncomeItems).toBeDefined();
    expect(budgetModule.saveBudgetIncomeItems).toBeDefined();
    expect(budgetModule.getBudgetExpenseItems).toBeDefined();
    expect(budgetModule.saveBudgetExpenseItems).toBeDefined();
  });
});
