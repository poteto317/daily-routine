import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetMonthlySummaryCards } from "../components/BudgetMonthlySummaryCards";

const monthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

describe("BudgetMonthlySummaryCards", () => {
  it("「月に使える金額」をmonthlyAllowance.allowanceから導出して表示する", () => {
    render(
      <BudgetMonthlySummaryCards
        dailyBudget={6333}
        expenseCount={5}
        monthlyAllowance={monthlyAllowance}
        onNavigateToAllowanceSettings={jest.fn()}
        remaining={172000}
        totalExpense={18000}
      />,
    );

    // monthBudget propは廃止したため、表示額は常に
    // monthlyAllowance.allowance と一致する（値が食い違うことはない）。
    expect(screen.getByText("￥190,000")).toBeInTheDocument();
  });

  it("使った金額と残りを表示する", () => {
    render(
      <BudgetMonthlySummaryCards
        dailyBudget={6333}
        expenseCount={5}
        monthlyAllowance={monthlyAllowance}
        onNavigateToAllowanceSettings={jest.fn()}
        remaining={172000}
        totalExpense={18000}
      />,
    );

    expect(screen.getByText("￥18,000")).toBeInTheDocument();
    expect(screen.getByText("￥172,000")).toBeInTheDocument();
  });

  it("残りがマイナスのとき予算オーバーの表示をする", () => {
    render(
      <BudgetMonthlySummaryCards
        dailyBudget={0}
        expenseCount={5}
        monthlyAllowance={monthlyAllowance}
        onNavigateToAllowanceSettings={jest.fn()}
        remaining={-5000}
        totalExpense={195000}
      />,
    );

    expect(screen.getByText("予算オーバー")).toBeInTheDocument();
  });

  it("収入・固定費・変動費を編集ボタンでonNavigateToAllowanceSettingsが呼ばれる", () => {
    const onNavigateToAllowanceSettings = jest.fn();
    render(
      <BudgetMonthlySummaryCards
        dailyBudget={6333}
        expenseCount={5}
        monthlyAllowance={monthlyAllowance}
        onNavigateToAllowanceSettings={onNavigateToAllowanceSettings}
        remaining={172000}
        totalExpense={18000}
      />,
    );

    fireEvent.click(screen.getByText("収入・固定費・変動費を編集"));

    expect(onNavigateToAllowanceSettings).toHaveBeenCalled();
  });
});
