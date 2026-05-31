import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListManagementHeader } from "../TodoListManagementHeader";

const defaultProps = {
  showForm: false,
  onOpenForm: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListManagementHeader", () => {
  it("タイトルを表示する", () => {
    render(<TodoListManagementHeader {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /Todoリスト管理/ }),
    ).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<TodoListManagementHeader {...defaultProps} />);
    expect(
      screen.getByText(
        "ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示を切り替えられます。",
      ),
    ).toBeInTheDocument();
  });

  it("showForm が false のとき追加ボタンを表示する", () => {
    render(<TodoListManagementHeader {...defaultProps} showForm={false} />);
    expect(
      screen.getByRole("button", { name: /新しいリストを追加/ }),
    ).toBeInTheDocument();
  });

  it("showForm が true のとき追加ボタンを表示しない", () => {
    render(<TodoListManagementHeader {...defaultProps} showForm={true} />);
    expect(
      screen.queryByRole("button", { name: /新しいリストを追加/ }),
    ).not.toBeInTheDocument();
  });

  it("追加ボタンクリックで onOpenForm が呼ばれる", () => {
    render(<TodoListManagementHeader {...defaultProps} showForm={false} />);
    fireEvent.click(
      screen.getByRole("button", { name: /新しいリストを追加/ }),
    );
    expect(defaultProps.onOpenForm).toHaveBeenCalledTimes(1);
  });
});
