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
});
