import { render, screen, fireEvent } from "@testing-library/react";
import { TodoCategoryManagementHeader } from "../TodoCategoryManagementHeader";

const defaultProps = {
  showForm: false,
  onOpenForm: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoCategoryManagementHeader", () => {
  it("タイトルを表示する", () => {
    render(<TodoCategoryManagementHeader {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: /カテゴリ管理/ }),
    ).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<TodoCategoryManagementHeader {...defaultProps} />);
    expect(
      screen.getByText(
        "Todoアイテムに付けるカテゴリを管理します。カテゴリの追加・名前の変更・色の変更・削除ができます。",
      ),
    ).toBeInTheDocument();
  });

  it("showForm が false のとき追加ボタンを表示する", () => {
    render(<TodoCategoryManagementHeader {...defaultProps} showForm={false} />);
    expect(
      screen.getByRole("button", { name: /新しいカテゴリを追加/ }),
    ).toBeInTheDocument();
  });

  it("showForm が true のとき追加ボタンを表示しない", () => {
    render(<TodoCategoryManagementHeader {...defaultProps} showForm={true} />);
    expect(
      screen.queryByRole("button", { name: /新しいカテゴリを追加/ }),
    ).not.toBeInTheDocument();
  });

  it("追加ボタンクリックで onOpenForm が呼ばれる", () => {
    render(<TodoCategoryManagementHeader {...defaultProps} showForm={false} />);
    fireEvent.click(
      screen.getByRole("button", { name: /新しいカテゴリを追加/ }),
    );
    expect(defaultProps.onOpenForm).toHaveBeenCalledTimes(1);
  });
});
