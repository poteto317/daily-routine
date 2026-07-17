import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetAllowanceItemRow } from "../components/BudgetAllowanceItemRow";

const item = { id: "expense-1", name: "家賃", amount: 80000 };

describe("BudgetAllowanceItemRow", () => {
  const setup = (
    overrides: Partial<{
      isEditing: boolean;
      editingName: string;
      editingAmount: string;
      kind: "fixed" | "variable" | undefined;
    }> = {},
  ) => {
    const onChangeEditingName = jest.fn();
    const onChangeEditingAmount = jest.fn();
    const onCommitEdit = jest.fn();
    const onCancelEdit = jest.fn();
    const onStartEdit = jest.fn();
    const onDelete = jest.fn();
    const onToggleKind = jest.fn();

    render(
      <BudgetAllowanceItemRow
        item={item}
        isEditing={overrides.isEditing ?? false}
        editingName={overrides.editingName ?? ""}
        editingAmount={overrides.editingAmount ?? ""}
        onChangeEditingName={onChangeEditingName}
        onChangeEditingAmount={onChangeEditingAmount}
        onCommitEdit={onCommitEdit}
        onCancelEdit={onCancelEdit}
        onStartEdit={onStartEdit}
        onDelete={onDelete}
        kind={overrides.kind}
        onToggleKind={overrides.kind !== undefined ? onToggleKind : undefined}
      />,
    );

    return {
      onChangeEditingName,
      onChangeEditingAmount,
      onCommitEdit,
      onCancelEdit,
      onStartEdit,
      onDelete,
      onToggleKind,
    };
  };

  it("非編集時は名前と金額を表示する", () => {
    setup();

    expect(screen.getByText("家賃")).toBeInTheDocument();
    expect(screen.getByText("￥80,000")).toBeInTheDocument();
  });

  it("編集ボタンで onStartEdit が呼ばれる", () => {
    const { onStartEdit } = setup();

    fireEvent.click(screen.getByLabelText("家賃を編集"));

    expect(onStartEdit).toHaveBeenCalledWith(item);
  });

  it("削除ボタンで onDelete が呼ばれる", () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByLabelText("家賃を削除"));

    expect(onDelete).toHaveBeenCalledWith(item);
  });

  it("kindが指定されている場合は分類バッジを表示し、クリックで onToggleKind が呼ばれる", () => {
    const { onToggleKind } = setup({ kind: "fixed" });

    const badge = screen.getByLabelText("家賃の分類を切り替える");
    expect(badge).toHaveTextContent("固定費");

    fireEvent.click(badge);
    expect(onToggleKind).toHaveBeenCalledWith("expense-1");
  });

  it("kindが未指定の場合は分類バッジを表示しない", () => {
    setup();

    expect(
      screen.queryByLabelText("家賃の分類を切り替える"),
    ).not.toBeInTheDocument();
  });

  it("編集中は名前・金額の入力欄を表示する", () => {
    setup({ isEditing: true, editingName: "マンション家賃", editingAmount: "85000" });

    expect(screen.getByDisplayValue("マンション家賃")).toBeInTheDocument();
    expect(screen.getByDisplayValue("85000")).toBeInTheDocument();
  });

  it("編集中の項目名入力欄にaria-labelが付与されている（スクリーンリーダー対応）", () => {
    setup({ isEditing: true, editingName: "マンション家賃", editingAmount: "85000" });

    expect(screen.getByLabelText("項目名")).toHaveValue("マンション家賃");
  });

  it("編集中に名前を変更すると onChangeEditingName が呼ばれる", () => {
    const { onChangeEditingName } = setup({
      isEditing: true,
      editingName: "家賃",
      editingAmount: "80000",
    });

    fireEvent.change(screen.getByDisplayValue("家賃"), {
      target: { value: "マンション家賃" },
    });

    expect(onChangeEditingName).toHaveBeenCalledWith("マンション家賃");
  });

  it("編集中にEnterキーで onCommitEdit が呼ばれる", () => {
    const { onCommitEdit } = setup({
      isEditing: true,
      editingName: "家賃",
      editingAmount: "80000",
    });

    fireEvent.keyDown(screen.getByDisplayValue("家賃"), { key: "Enter" });

    expect(onCommitEdit).toHaveBeenCalled();
  });

  it("編集中にEscapeキーで onCancelEdit が呼ばれる", () => {
    const { onCancelEdit } = setup({
      isEditing: true,
      editingName: "家賃",
      editingAmount: "80000",
    });

    fireEvent.keyDown(screen.getByDisplayValue("家賃"), { key: "Escape" });

    expect(onCancelEdit).toHaveBeenCalled();
  });

  it("編集中に名前欄から金額欄へフォーカス移動(blur)しても編集は終了しない（onCommitEdit/onCancelEditは呼ばれない）", () => {
    const { onCommitEdit, onCancelEdit } = setup({
      isEditing: true,
      editingName: "家賃",
      editingAmount: "80000",
    });

    fireEvent.blur(screen.getByDisplayValue("家賃"));

    expect(onCommitEdit).not.toHaveBeenCalled();
    expect(onCancelEdit).not.toHaveBeenCalled();
    // 編集中の入力欄は表示されたまま（編集セッションが継続している）
    expect(screen.getByDisplayValue("家賃")).toBeInTheDocument();
  });

  it("保存ボタンで onCommitEdit が呼ばれる", () => {
    const { onCommitEdit } = setup({
      isEditing: true,
      editingName: "マンション家賃",
      editingAmount: "85000",
    });

    fireEvent.click(screen.getByText("保存"));

    expect(onCommitEdit).toHaveBeenCalled();
  });

  it("キャンセルボタンで onCancelEdit が呼ばれる", () => {
    const { onCancelEdit } = setup({
      isEditing: true,
      editingName: "家賃",
      editingAmount: "80000",
    });

    fireEvent.click(screen.getByText("キャンセル"));

    expect(onCancelEdit).toHaveBeenCalled();
  });
});
