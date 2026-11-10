import { render, screen, fireEvent } from "@testing-library/react";
import { MenuOrderSection } from "../MenuOrderSection";
import texts from "../../locales/ja.json";

jest.mock("@/features/todo-lists/storage", () => ({
  getTodoLists: jest.fn(() => [
    { id: "list-1", title: "買い物リスト", items: [] },
  ]),
}));

describe("MenuOrderSection", () => {
  const defaultProps = {
    menuOrder: ["todo-list:list-1", "journal", "calendar"],
    setMenuOrderAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("タイトル、説明、リセットボタン、メニュー項目一覧をレンダリングする", () => {
    render(<MenuOrderSection {...defaultProps} />);

    expect(screen.getByText(texts.menuOrder.title)).toBeInTheDocument();
    expect(screen.getByText(texts.menuOrder.description)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: texts.menuOrder.resetButton }),
    ).toBeInTheDocument();

    expect(screen.getByText("買い物リスト")).toBeInTheDocument();
    expect(screen.getByText("ジャーナル")).toBeInTheDocument();
  });

  it("並び替えの一覧に「業務日誌」が出る", () => {
    render(<MenuOrderSection {...defaultProps} />);

    expect(screen.getByText("業務日誌")).toBeInTheDocument();
  });

  it("リセットボタンをクリックすると初期順序でsetMenuOrderActionが呼ばれる", () => {
    render(<MenuOrderSection {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: texts.menuOrder.resetButton }),
    );

    expect(defaultProps.setMenuOrderAction).toHaveBeenCalled();
  });

  it("項目のドラッグアンドドロップで並び替えが発生する", () => {
    const { container } = render(<MenuOrderSection {...defaultProps} />);

    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBeGreaterThan(1);

    // 最初の項目をドラッグ開始
    fireEvent.dragStart(listItems[0]);

    // 2番目の項目の上にドラッグ
    fireEvent.dragOver(listItems[1]);

    // 2番目の項目にドロップ
    fireEvent.drop(listItems[1]);

    expect(defaultProps.setMenuOrderAction).toHaveBeenCalled();

    // dragEnd で状態がリセットされる
    fireEvent.dragEnd(listItems[0]);
  });
});
