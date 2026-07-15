import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoItemDragHandle } from "../TodoItemDragHandle";

describe("TodoItemDragHandle", () => {
  const defaultProps = {
    attributes: { "aria-roledescription": "sortable" } as React.HTMLAttributes<HTMLButtonElement>,
    listeners: {},
  };

  it("並び替えボタンが表示される", () => {
    render(<TodoItemDragHandle {...defaultProps} />);
    expect(screen.getByRole("button", { name: "並び替え" })).toBeInTheDocument();
  });
});
