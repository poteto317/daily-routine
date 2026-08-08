import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuInsertButton } from "../TodoItemActionMenuInsertButton";

describe("TodoItemActionMenuInsertButton", () => {
  it("下に追加ボタンを表示する", () => {
    render(<TodoItemActionMenuInsertButton onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /下に追加/ })).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuInsertButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /下に追加/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
