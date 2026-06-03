import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoItemDragHandle } from "../TodoItemDragHandle";

describe("TodoItemDragHandle", () => {
  const defaultProps = {
    attributes: { "aria-roledescription": "sortable" } as React.HTMLAttributes<HTMLButtonElement>,
    listeners: {},
    hideCompleted: false,
  };

  it("hideCompleted=false のとき並び替えボタンが表示される", () => {
    render(<TodoItemDragHandle {...defaultProps} />);
    expect(screen.getByRole("button", { name: "並び替え" })).toBeInTheDocument();
  });

  it("hideCompleted=true のとき非表示になる", () => {
    render(<TodoItemDragHandle {...defaultProps} hideCompleted={true} />);
    expect(
      screen.queryByRole("button", { name: "並び替え" }),
    ).not.toBeInTheDocument();
  });
});
