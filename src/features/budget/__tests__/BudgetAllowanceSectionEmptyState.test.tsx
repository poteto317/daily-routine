import { render, screen } from "@testing-library/react";
import { BudgetAllowanceSectionEmptyState } from "../components/BudgetAllowanceSectionEmptyState";

describe("BudgetAllowanceSectionEmptyState", () => {
  it("空状態メッセージと説明文を表示する", () => {
    render(<BudgetAllowanceSectionEmptyState />);

    expect(screen.getByText("項目はまだありません")).toBeInTheDocument();
    expect(
      screen.getByText("「＋ 新しい項目を追加」から項目を作成してください"),
    ).toBeInTheDocument();
  });
});
