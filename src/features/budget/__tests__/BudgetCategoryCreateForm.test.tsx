import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetCategoryCreateForm } from "../components/BudgetCategoryCreateForm";

describe("BudgetCategoryCreateForm", () => {
  const setup = (nameInput = "") => {
    const inputRef = createRef<HTMLInputElement>();
    const onChangeName = jest.fn();
    const onCreate = jest.fn();
    const onCancel = jest.fn();

    render(
      <BudgetCategoryCreateForm
        inputRef={inputRef}
        nameInput={nameInput}
        onChangeName={onChangeName}
        onCreate={onCreate}
        onCancel={onCancel}
      />,
    );

    return { onChangeName, onCreate, onCancel };
  };

  it("入力すると onChangeName が呼ばれる", () => {
    const { onChangeName } = setup();

    fireEvent.change(screen.getByPlaceholderText("カテゴリ名"), {
      target: { value: "交通費" },
    });

    expect(onChangeName).toHaveBeenCalledWith("交通費");
  });

  it("Enterキーで onCreate が呼ばれる", () => {
    const { onCreate } = setup("交通費");

    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Enter",
    });

    expect(onCreate).toHaveBeenCalled();
  });

  it("Escapeキーで onCancel が呼ばれる", () => {
    const { onCancel } = setup("交通費");

    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Escape",
    });

    expect(onCancel).toHaveBeenCalled();
  });

  it("名前が空のときは作成ボタンが無効になる", () => {
    setup("");

    expect(screen.getByText("作成")).toBeDisabled();
  });

  it("名前が入力されていれば作成ボタンから onCreate を呼べる", () => {
    const { onCreate } = setup("交通費");

    fireEvent.click(screen.getByText("作成"));

    expect(onCreate).toHaveBeenCalled();
  });

  it("キャンセルボタンで onCancel が呼ばれる", () => {
    const { onCancel } = setup("交通費");

    fireEvent.click(screen.getByText("キャンセル"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("作成ボタンのクリックで入力欄からフォーカスが外れる（ソフトウェアキーボードを閉じるため）", () => {
    setup("交通費");
    const input = screen.getByPlaceholderText("カテゴリ名");
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "作成" }));

    expect(document.activeElement).toBe(document.body);
  });

  it("Enterキーでの作成でも入力欄からフォーカスが外れる", () => {
    setup("交通費");
    const input = screen.getByPlaceholderText("カテゴリ名");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(document.activeElement).toBe(document.body);
  });

  it("空欄でEnterを押しても作成されず、フォーカスも外れない", () => {
    // 作成ボタンは disabled で守られるが、Enterキー経路には元々ガードがない。
    // 何も作成されていないのにキーボードだけ閉じるのを防ぐ。
    const { onCreate } = setup("");
    const input = screen.getByPlaceholderText("カテゴリ名");
    input.focus();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCreate).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("送信可否の判定が作成ボタンの活性状態とEnterキーの可否で一致する", () => {
    const { onCreate } = setup("   ");

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Enter",
    });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("全角スペースのみでも作成できない（ハンドラ側の正規化と判定が一致する）", () => {
    const { onCreate } = setup("　　");

    expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();

    fireEvent.keyDown(screen.getByPlaceholderText("カテゴリ名"), {
      key: "Enter",
    });

    expect(onCreate).not.toHaveBeenCalled();
  });
});
