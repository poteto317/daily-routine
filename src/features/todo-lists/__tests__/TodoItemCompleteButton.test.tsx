import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItemCompleteButton } from "../TodoItemCompleteButton";

describe("TodoItemCompleteButton", () => {
  const defaultProps = {
    listId: "list-1",
    itemId: "item-1",
    isCompleted: false,
    isDragActive: false,
    onToggle: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("未完了状態でレンダリングされる", () => {
    render(<TodoItemCompleteButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: "完了にする" });
    expect(btn).toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("完了状態でチェックマークが表示される", () => {
    render(<TodoItemCompleteButton {...defaultProps} isCompleted={true} />);
    expect(screen.getByRole("button", { name: "未完了に戻す" })).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("isDragActive=true のときボタンが無効化される", () => {
    render(<TodoItemCompleteButton {...defaultProps} isDragActive={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("クリックで onToggle が呼ばれる", async () => {
    const onToggle = jest.fn();
    render(<TodoItemCompleteButton {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledWith("list-1", "item-1");
  });
});
