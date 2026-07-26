import { render, screen } from "@testing-library/react";
import { BudgetSummaryCardsGrid } from "../components/BudgetSummaryCardsGrid";

describe("BudgetSummaryCardsGrid", () => {
  it("childrenをグリッドレイアウト内に表示する", () => {
    render(
      <BudgetSummaryCardsGrid>
        <p>カードA</p>
        <p>カードB</p>
      </BudgetSummaryCardsGrid>,
    );

    expect(screen.getByText("カードA")).toBeInTheDocument();
    expect(screen.getByText("カードB")).toBeInTheDocument();
  });

  it("グリッドのクラス名を持つラッパーdivを描画する", () => {
    const { container } = render(
      <BudgetSummaryCardsGrid>
        <p>カードA</p>
      </BudgetSummaryCardsGrid>,
    );

    expect(container.firstChild).toHaveClass(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "gap-4",
      "mb-6",
    );
  });
});
