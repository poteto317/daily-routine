import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItemSelectCheckbox } from "../TodoItemSelectCheckbox";

describe("TodoItemSelectCheckbox", () => {
  const defaultProps = {
    itemId: "item-1",
    title: "テストタスク",
    isSelected: false,
    onToggleSelectAction: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("非選択状態でレンダリングされる", () => {
    render(<TodoItemSelectCheckbox {...defaultProps} />);
    const btn = screen.getByRole("checkbox");
    expect(btn).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("選択状態でチェックマークが表示される", () => {
    render(<TodoItemSelectCheckbox {...defaultProps} isSelected={true} />);
    const btn = screen.getByRole("checkbox");
    expect(btn).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("aria-label にアイテムタイトルが含まれる", () => {
    render(<TodoItemSelectCheckbox {...defaultProps} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("テストタスク"),
    );
  });

  it("クリックで onToggleSelectAction が呼ばれる", async () => {
    const onToggleSelectAction = jest.fn();
    render(
      <TodoItemSelectCheckbox
        {...defaultProps}
        onToggleSelectAction={onToggleSelectAction}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelectAction).toHaveBeenCalledWith("item-1");
  });
});
