import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseRow } from "../components/BudgetExpenseRow";

const expense = {
  id: "e1",
  date: "2026-05-22",
  amount: 850,
  categoryId: "cat-lunch",
  createdAt: "2026-05-22T00:00:00.000Z",
};
const category = {
  id: "cat-lunch",
  name: "ランチ",
  createdAt: "2026-05-01T00:00:00.000Z",
};

const renderRow = (overrides: Record<string, unknown> = {}) => {
  const onStartEdit = jest.fn();
  const onDelete = jest.fn();
  render(
    <BudgetExpenseRow
      expense={expense}
      category={category}
      onStartEdit={onStartEdit}
      onDelete={onDelete}
      {...overrides}
    />,
  );
  return { onStartEdit, onDelete };
};

describe("BudgetExpenseRow", () => {
  it("金額とカテゴリを表示する", () => {
    renderRow();

    expect(screen.getByText("🏷️ ランチ")).toBeInTheDocument();
    expect(screen.getByText(/850/)).toBeInTheDocument();
  });

  it("カテゴリが無い支出には、カテゴリのタグを表示しない", () => {
    renderRow({ category: undefined });

    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
  });

  it("編集ボタンで、その支出を渡して onStartEdit を呼ぶ", () => {
    const { onStartEdit } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: /の支出を編集/ }));

    expect(onStartEdit).toHaveBeenCalledWith(expense);
  });

  it("削除ボタンで、支出の ID を渡して onDelete を呼ぶ", () => {
    const { onDelete } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: /の支出を削除/ }));

    expect(onDelete).toHaveBeenCalledWith("e1");
  });

  it("入力欄や保存ボタンは表示しない（表示専用）", () => {
    renderRow();

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });
});
