import { render, screen } from "@testing-library/react";
import { TodoCategoryManagementEmptyState } from "../TodoCategoryManagementEmptyState";

describe("TodoCategoryManagementEmptyState", () => {
  it("空リストメッセージを表示する", () => {
    render(<TodoCategoryManagementEmptyState />);
    expect(screen.getByText("カテゴリはまだありません")).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<TodoCategoryManagementEmptyState />);
    expect(
      screen.getByText(
        "「＋ 新しいカテゴリを追加」からカテゴリを作成してください",
      ),
    ).toBeInTheDocument();
  });

  it("絵文字アイコンを表示する", () => {
    render(<TodoCategoryManagementEmptyState />);
    expect(screen.getByText("🏷️")).toBeInTheDocument();
  });
});
