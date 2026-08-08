import { render, screen } from "@testing-library/react";
import { TodoListEmptyState } from "../TodoListEmptyState";

describe("TodoListEmptyState", () => {
  it("hasAnyItems が false のとき「まだTodoがありません」と説明文を表示する", () => {
    render(<TodoListEmptyState hasAnyItems={false} />);
    expect(screen.getByText("まだTodoがありません")).toBeInTheDocument();
    expect(
      screen.getByText("下のフォームからTodoを追加しましょう"),
    ).toBeInTheDocument();
  });

  it("hasAnyItems が true のとき「完了済みのみです」を表示し説明文は表示しない", () => {
    render(<TodoListEmptyState hasAnyItems={true} />);
    expect(screen.getByText("完了済みのみです")).toBeInTheDocument();
    expect(
      screen.queryByText("下のフォームからTodoを追加しましょう"),
    ).not.toBeInTheDocument();
  });
});
