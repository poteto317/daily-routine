import { render, screen } from "@testing-library/react";
import { BudgetExpenseListItem } from "../components/BudgetExpenseListItem";

const expense = {
  id: "e1",
  date: "2026-05-22",
  amount: 850,
  createdAt: "2026-05-22T00:00:00.000Z",
};

const renderItem = (isEditing: boolean) =>
  render(
    <BudgetExpenseListItem
      expense={expense}
      category={undefined}
      categories={[]}
      isEditing={isEditing}
      editingExpenseDate="2026-05-22"
      editingExpenseAmount="850"
      editingExpenseCategoryId=""
      onStartEdit={jest.fn()}
      onCancelEdit={jest.fn()}
      onSaveEdit={jest.fn()}
      onEditDateChange={jest.fn()}
      onEditAmountChange={jest.fn()}
      onEditCategoryIdChange={jest.fn()}
      onDelete={jest.fn()}
    />,
  );

describe("BudgetExpenseListItem（表示と編集の切り替え）", () => {
  it("編集中でなければ、表示行（編集・削除ボタン）を表示する", () => {
    renderItem(false);

    expect(
      screen.getByRole("button", { name: /の支出を編集/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });

  it("編集中なら、編集フォーム（保存・キャンセル）を表示し、表示行は出さない", () => {
    renderItem(true);

    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /の支出を編集/ }),
    ).not.toBeInTheDocument();
  });
});
