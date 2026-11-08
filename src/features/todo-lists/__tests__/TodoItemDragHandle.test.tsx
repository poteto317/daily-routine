import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoItemDragHandle } from "../TodoItemDragHandle";

describe("TodoItemDragHandle", () => {
  const defaultProps = {
    attributes: {
      "aria-roledescription": "sortable",
    } as React.HTMLAttributes<HTMLButtonElement>,
    listeners: {},
    tone: "onDark" as const,
  };

  it("並び替えボタンが表示される", () => {
    render(<TodoItemDragHandle {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "並び替え" }),
    ).toBeInTheDocument();
  });

  it('tone="onDark" では、ダークモードの暗い背景向けの明るい色になる', () => {
    render(<TodoItemDragHandle {...defaultProps} tone="onDark" />);
    const button = screen.getByRole("button", { name: "並び替え" });
    expect(button).toHaveClass(
      "dark:text-gray-400",
      "dark:hover:text-gray-300",
    );
    expect(button).not.toHaveClass("dark:text-gray-500");
    expect(button).not.toHaveClass("dark:hover:text-gray-700");
  });

  it('tone="onLight" では、ダークモードでも明るい行（dark:bg-gray-200）向けの暗い色になる', () => {
    render(<TodoItemDragHandle {...defaultProps} tone="onLight" />);
    const button = screen.getByRole("button", { name: "並び替え" });
    expect(button).toHaveClass(
      "dark:text-gray-500",
      "dark:hover:text-gray-700",
    );
    expect(button).not.toHaveClass("dark:text-gray-400");
    expect(button).not.toHaveClass("dark:hover:text-gray-300");
  });
});
