import { render, screen } from "@testing-library/react";
import { TodoListManagementEmptyState } from "../TodoListManagementEmptyState";

describe("TodoListManagementEmptyState", () => {
  it("空リストメッセージを表示する", () => {
    render(<TodoListManagementEmptyState />);
    expect(screen.getByText("Todoリストはまだありません")).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<TodoListManagementEmptyState />);
    expect(
      screen.getByText("「＋ 新しいリストを追加」からリストを作成してください"),
    ).toBeInTheDocument();
  });

  it("絵文字アイコンを表示する", () => {
    render(<TodoListManagementEmptyState />);
    expect(screen.getByText("📝")).toBeInTheDocument();
  });
});
