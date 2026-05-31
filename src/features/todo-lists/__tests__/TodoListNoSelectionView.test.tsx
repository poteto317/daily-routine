import { render, screen } from "@testing-library/react";
import { TodoListNoSelectionView } from "../TodoListNoSelectionView";

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("TodoListNoSelectionView", () => {
  it("「Todoリストが選択されていません」を表示する", () => {
    render(<TodoListNoSelectionView />);
    expect(
      screen.getByText("Todoリストが選択されていません"),
    ).toBeInTheDocument();
  });

  it("ヒントメッセージを表示する", () => {
    render(<TodoListNoSelectionView />);
    expect(
      screen.getByText(
        "ハンバーガーメニューからTodoリストを選択してください",
      ),
    ).toBeInTheDocument();
  });

  it("絵文字アイコンを表示する", () => {
    render(<TodoListNoSelectionView />);
    expect(screen.getByText("📝")).toBeInTheDocument();
  });
});
