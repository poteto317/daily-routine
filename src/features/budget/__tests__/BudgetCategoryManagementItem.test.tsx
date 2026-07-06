import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetCategoryManagementItem } from "../components/BudgetCategoryManagementItem";

const category = {
  id: "cat-1",
  name: "食料品",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("BudgetCategoryManagementItem", () => {
  it("編集中でない場合はカテゴリ名を表示する", () => {
    render(
      <BudgetCategoryManagementItem
        category={category}
        editingCategoryId={null}
        editingCategoryNameValue=""
        onChangeNameValue={jest.fn()}
        onCommitEdit={jest.fn()}
        onCancelEdit={jest.fn()}
        onStartEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("🏷️ 食料品")).toBeInTheDocument();
  });

  it("編集ボタンでonStartEditが呼ばれる", () => {
    const onStartEdit = jest.fn();
    render(
      <BudgetCategoryManagementItem
        category={category}
        editingCategoryId={null}
        editingCategoryNameValue=""
        onChangeNameValue={jest.fn()}
        onCommitEdit={jest.fn()}
        onCancelEdit={jest.fn()}
        onStartEdit={onStartEdit}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("食料品 を編集"));

    expect(onStartEdit).toHaveBeenCalledWith("cat-1", "食料品");
  });

  it("削除ボタンでonDeleteが呼ばれる", () => {
    const onDelete = jest.fn();
    render(
      <BudgetCategoryManagementItem
        category={category}
        editingCategoryId={null}
        editingCategoryNameValue=""
        onChangeNameValue={jest.fn()}
        onCommitEdit={jest.fn()}
        onCancelEdit={jest.fn()}
        onStartEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByLabelText("食料品 を削除"));

    expect(onDelete).toHaveBeenCalledWith(category);
  });

  it("編集中は入力欄を表示し、変更/Enter/Escapeを扱う", () => {
    const onChangeNameValue = jest.fn();
    const onCommitEdit = jest.fn();
    const onCancelEdit = jest.fn();

    render(
      <BudgetCategoryManagementItem
        category={category}
        editingCategoryId="cat-1"
        editingCategoryNameValue="食料品"
        onChangeNameValue={onChangeNameValue}
        onCommitEdit={onCommitEdit}
        onCancelEdit={onCancelEdit}
        onStartEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const input = screen.getByDisplayValue("食料品");
    expect(screen.queryByText("🏷️ 食料品")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("食料品 を編集")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "食費" } });
    expect(onChangeNameValue).toHaveBeenCalledWith("食費");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommitEdit).toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(onCancelEdit).toHaveBeenCalled();
  });

  it("編集中の入力欄からフォーカスが外れるとonCommitEditが呼ばれる", () => {
    const onCommitEdit = jest.fn();

    render(
      <BudgetCategoryManagementItem
        category={category}
        editingCategoryId="cat-1"
        editingCategoryNameValue="食料品"
        onChangeNameValue={jest.fn()}
        onCommitEdit={onCommitEdit}
        onCancelEdit={jest.fn()}
        onStartEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.blur(screen.getByDisplayValue("食料品"));

    expect(onCommitEdit).toHaveBeenCalled();
  });
});
