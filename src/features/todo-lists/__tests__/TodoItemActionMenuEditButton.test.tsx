import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuEditButton } from "../TodoItemActionMenuEditButton";

describe("TodoItemActionMenuEditButton", () => {
  it("編集ボタンを表示する", () => {
    render(<TodoItemActionMenuEditButton onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuEditButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
