import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListClipboardBar } from "../TodoListClipboardBar";

const defaultProps = {
  clipboardCount: 3,
  onPasteAction: jest.fn(),
  onClearClipboardAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListClipboardBar", () => {
  it("クリップボード件数を表示する", () => {
    render(<TodoListClipboardBar {...defaultProps} />);
    expect(screen.getByText(/3件のTodoをペーストできます/)).toBeInTheDocument();
  });

  it("ペーストボタンクリックで onPasteAction が呼ばれる", () => {
    render(<TodoListClipboardBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /ペースト/ }));
    expect(defaultProps.onPasteAction).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンクリックで onClearClipboardAction が呼ばれる", () => {
    render(<TodoListClipboardBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(defaultProps.onClearClipboardAction).toHaveBeenCalledTimes(1);
  });

  it("1件の場合も正しく表示する", () => {
    render(<TodoListClipboardBar {...defaultProps} clipboardCount={1} />);
    expect(screen.getByText(/1件のTodoをペーストできます/)).toBeInTheDocument();
  });
});
