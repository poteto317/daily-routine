import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetMoneyCard } from "../components/BudgetMoneyCard";

describe("BudgetMoneyCard", () => {
  it("ラベルと金額（円表示）を表示する", () => {
    render(
      <BudgetMoneyCard
        cardClassName="bg-blue-50 rounded-xl p-4"
        label="月に使える金額"
        value={190000}
        valueClassName="text-2xl font-bold text-blue-600"
      />,
    );

    expect(screen.getByText("月に使える金額")).toBeInTheDocument();
    expect(screen.getByText("￥190,000")).toBeInTheDocument();
  });

  it("labelActionを渡すとラベル横に表示され、クリックイベントを扱える", () => {
    const onClick = jest.fn();
    render(
      <BudgetMoneyCard
        cardClassName="bg-blue-50 rounded-xl p-4"
        label="月に使える金額"
        labelAction={
          <button onClick={onClick}>収入・固定費・変動費を編集</button>
        }
        value={190000}
        valueClassName="text-2xl font-bold text-blue-600"
      />,
    );

    fireEvent.click(screen.getByText("収入・固定費・変動費を編集"));

    expect(onClick).toHaveBeenCalled();
  });

  it("childrenを金額の下に表示する", () => {
    render(
      <BudgetMoneyCard
        cardClassName="bg-red-50 rounded-xl p-4"
        label="使った金額"
        value={18000}
        valueClassName="text-2xl font-bold text-red-600"
      >
        <p>5件</p>
      </BudgetMoneyCard>,
    );

    expect(screen.getByText("5件")).toBeInTheDocument();
  });
});
