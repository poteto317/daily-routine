import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItemCollapseButton } from "../TodoItemCollapseButton";

describe("TodoItemCollapseButton", () => {
  const defaultProps = {
    itemId: "item-1",
    isParent: true,
    isCollapsed: false,
    onToggleCollapseAction: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("isParent=false のときスペーサーが表示される", () => {
    const { container } = render(
      <TodoItemCollapseButton {...defaultProps} isParent={false} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("展開状態のとき ▼ が表示される", () => {
    render(<TodoItemCollapseButton {...defaultProps} isCollapsed={false} />);
    expect(screen.getByRole("button")).toHaveTextContent("▼");
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("折りたたみ状態のとき ▶ が表示される", () => {
    render(<TodoItemCollapseButton {...defaultProps} isCollapsed={true} />);
    expect(screen.getByRole("button")).toHaveTextContent("▶");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("クリックで onToggleCollapseAction が呼ばれる", async () => {
    const onToggleCollapseAction = jest.fn();
    render(
      <TodoItemCollapseButton
        {...defaultProps}
        onToggleCollapseAction={onToggleCollapseAction}
      />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onToggleCollapseAction).toHaveBeenCalledWith("item-1");
  });
});
