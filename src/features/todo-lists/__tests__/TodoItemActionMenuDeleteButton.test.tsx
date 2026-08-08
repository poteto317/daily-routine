import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuDeleteButton } from "../TodoItemActionMenuDeleteButton";

describe("TodoItemActionMenuDeleteButton", () => {
  it("削除ボタンを表示する", () => {
    render(<TodoItemActionMenuDeleteButton onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuDeleteButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
