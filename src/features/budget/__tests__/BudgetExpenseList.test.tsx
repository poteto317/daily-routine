import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseList } from "../components/BudgetExpenseList";

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00.000Z" },
];

describe("BudgetExpenseList", () => {
  it("支出が無い場合は空状態を表示する", () => {
    render(
      <BudgetExpenseList categories={categories} expenses={[]} onDelete={jest.fn()} />,
    );

    expect(screen.getByText("まだ支出の記録がありません")).toBeInTheDocument();
  });

  it("カテゴリが解決できる支出には🏷️タグを表示する", () => {
    render(
      <BudgetExpenseList
        categories={categories}
        expenses={[
          {
            id: "e1",
            date: "2026-05-22",
            amount: 850,
            categoryId: "cat-lunch",
            createdAt: "2026-05-22T00:00:00.000Z",
          },
        ]}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("🏷️ ランチ")).toBeInTheDocument();
  });

  it("categoryIdが無い、または解決できない支出には🏷️タグを表示しない", () => {
    render(
      <BudgetExpenseList
        categories={categories}
        expenses={[
          {
            id: "e1",
            date: "2026-05-22",
            amount: 850,
            createdAt: "2026-05-22T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-21",
            amount: 300,
            categoryId: "cat-404",
            createdAt: "2026-05-21T00:00:00.000Z",
          },
        ]}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
  });

  it("削除ボタンは支出ごとに区別できるaria-labelを持ち、押すとonDeleteへexpenseIdを渡す", () => {
    const onDelete = jest.fn();
    render(
      <BudgetExpenseList
        categories={categories}
        expenses={[
          {
            id: "e1",
            date: "2026-05-22",
            amount: 850,
            categoryId: "cat-lunch",
            createdAt: "2026-05-22T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-21",
            amount: 300,
            createdAt: "2026-05-21T00:00:00.000Z",
          },
        ]}
        onDelete={onDelete}
      />,
    );

    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    expect(deleteButtons).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "5月22日の支出を削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "5月21日の支出を削除" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "5月21日の支出を削除" }),
    );

    expect(onDelete).toHaveBeenCalledWith("e2");
  });

  it("削除ボタンにtype=buttonが設定されている", () => {
    render(
      <BudgetExpenseList
        categories={categories}
        expenses={[
          {
            id: "e1",
            date: "2026-05-22",
            amount: 850,
            createdAt: "2026-05-22T00:00:00.000Z",
          },
        ]}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /削除/ })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
