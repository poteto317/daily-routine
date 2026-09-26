import { render, screen } from "@testing-library/react";
import { BudgetDailySummaryCards } from "../components/BudgetDailySummaryCards";
import budgetTexts from "../locales/ja.json";

describe("BudgetDailySummaryCards", () => {
  it("当月（isCurrentMonth: true）のとき、1日あたり使える金額と今日の支出のカードを表示する", () => {
    render(
      <BudgetDailySummaryCards
        dailyRemainingBudget={2500}
        isCurrentMonth={true}
        todayExpense={1200}
      />,
    );

    expect(
      screen.getByText(budgetTexts.summary.dailyRemainingLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("￥2,500")).toBeInTheDocument();

    expect(
      screen.getByText(budgetTexts.summary.todayLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("￥1,200")).toBeInTheDocument();
  });

  it("「残り◯日」の残日数テキストは表示されないこと（要件: 残日数表示の削除）", () => {
    render(
      <BudgetDailySummaryCards
        dailyRemainingBudget={2500}
        isCurrentMonth={true}
        todayExpense={1200}
      />,
    );

    // 「残り.*日」にマッチする要素が存在しないことを確認
    expect(screen.queryByText(/残り\s*\d+\s*日/)).not.toBeInTheDocument();
  });

  it("当月ではない（isCurrentMonth: false）とき、カードを一切レンダリングしない", () => {
    const { container } = render(
      <BudgetDailySummaryCards
        dailyRemainingBudget={2500}
        isCurrentMonth={false}
        todayExpense={1200}
      />,
    );

    expect(
      screen.queryByText(budgetTexts.summary.dailyRemainingLabel),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(budgetTexts.summary.todayLabel),
    ).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("dailyRemainingBudget が負数の場合、0としてフォーマット表示される", () => {
    render(
      <BudgetDailySummaryCards
        dailyRemainingBudget={-500}
        isCurrentMonth={true}
        todayExpense={1000}
      />,
    );

    expect(
      screen.getByText(budgetTexts.summary.dailyRemainingLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("￥0")).toBeInTheDocument();
    expect(screen.getByText("￥1,000")).toBeInTheDocument();
  });
});
