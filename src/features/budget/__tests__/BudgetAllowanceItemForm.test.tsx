import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetAllowanceItemForm } from "../components/BudgetAllowanceItemForm";

describe("BudgetAllowanceItemForm", () => {
  const setup = (
    props: Partial<{
      nameInput: string;
      amountInput: string;
      kind: "fixed" | "variable" | undefined;
    }> = {},
  ) => {
    const inputRef = createRef<HTMLInputElement>();
    const onChangeName = jest.fn();
    const onChangeAmount = jest.fn();
    const onCreate = jest.fn();
    const onCancel = jest.fn();
    const onChangeKind = jest.fn();

    render(
      <BudgetAllowanceItemForm
        inputRef={inputRef}
        nameInput={props.nameInput ?? ""}
        amountInput={props.amountInput ?? ""}
        onChangeName={onChangeName}
        onChangeAmount={onChangeAmount}
        onCreate={onCreate}
        onCancel={onCancel}
        kind={props.kind}
        onChangeKind={props.kind !== undefined ? onChangeKind : undefined}
      />,
    );

    return { onChangeName, onChangeAmount, onCreate, onCancel, onChangeKind };
  };

  it("名前を入力すると onChangeName が呼ばれる", () => {
    const { onChangeName } = setup();

    fireEvent.change(screen.getByPlaceholderText("項目名（例: 家賃）"), {
      target: { value: "家賃" },
    });

    expect(onChangeName).toHaveBeenCalledWith("家賃");
  });

  it("金額を入力すると onChangeAmount が呼ばれる", () => {
    const { onChangeAmount } = setup();

    fireEvent.change(screen.getByPlaceholderText("例: 80000"), {
      target: { value: "80000" },
    });

    expect(onChangeAmount).toHaveBeenCalledWith("80000");
  });

  it("Enterキーで onCreate が呼ばれる", () => {
    const { onCreate } = setup({ nameInput: "家賃" });

    fireEvent.keyDown(screen.getByPlaceholderText("項目名（例: 家賃）"), {
      key: "Enter",
    });

    expect(onCreate).toHaveBeenCalled();
  });

  it("Escapeキーで onCancel が呼ばれる", () => {
    const { onCancel } = setup({ nameInput: "家賃" });

    fireEvent.keyDown(screen.getByPlaceholderText("項目名（例: 家賃）"), {
      key: "Escape",
    });

    expect(onCancel).toHaveBeenCalled();
  });

  it("項目名の入力欄にaria-labelが付与されている（スクリーンリーダー対応）", () => {
    setup();

    expect(screen.getByLabelText("項目名")).toBeInTheDocument();
  });

  it("名前が空のときは作成ボタンが無効になる", () => {
    setup({ nameInput: "" });

    expect(screen.getByText("作成")).toBeDisabled();
  });

  it("kindが未指定の場合は分類トグルを表示しない（収入項目用）", () => {
    setup();

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("kindが指定されている場合は固定費/変動費のトグルを表示する（支出項目用）", () => {
    setup({ kind: "fixed" });

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "固定費" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "変動費" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("分類トグルをクリックすると onChangeKind が呼ばれる", () => {
    const { onChangeKind } = setup({ kind: "fixed" });

    fireEvent.click(screen.getByRole("radio", { name: "変動費" }));

    expect(onChangeKind).toHaveBeenCalledWith("variable");
  });

  it("キャンセルボタンで onCancel が呼ばれる", () => {
    const { onCancel } = setup({ nameInput: "家賃" });

    fireEvent.click(screen.getByText("キャンセル"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("作成ボタンのクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    setup({ nameInput: "家賃" });
    const input = screen.getByPlaceholderText("項目名（例: 家賃）");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "作成" }));

    expect(document.activeElement).toBe(document.body);
  });

  it("Enterキーでの作成でも入力欄からフォーカスが外れる", () => {
    setup({ nameInput: "家賃" });
    const input = screen.getByPlaceholderText("項目名（例: 家賃）");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("金額欄でのEnterでも名前入力欄からフォーカスが外れる", () => {
    setup({ nameInput: "家賃" });
    const amountInput = screen.getByPlaceholderText("例: 80000");
    amountInput.focus();

    fireEvent.keyDown(amountInput, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("空欄でEnterを押しても作成されず、フォーカスも外れない", () => {
    // 作成ボタンは disabled で守られるが、Enterキー経路には元々ガードがない。
    // 何も作成されていないのにキーボードだけ閉じるのを防ぐ。
    const { onCreate } = setup({ nameInput: "" });
    const input = screen.getByPlaceholderText("項目名（例: 家賃）");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("送信可否の判定が作成ボタンの活性状態とEnterキーの可否で一致する", () => {
    const { onCreate } = setup({ nameInput: "   " });

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("項目名（例: 家賃）"), {
      key: "Enter",
    });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("全角スペースのみでも作成できない（ハンドラ側の正規化と判定が一致する）", () => {
    const { onCreate } = setup({ nameInput: "　　" });

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("項目名（例: 家賃）"), {
      key: "Enter",
    });

    expect(onCreate).not.toHaveBeenCalled();
  });
});
