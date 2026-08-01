import { render, screen } from "@testing-library/react";

jest.mock("../todoListActionStatusBarMode", () => ({
  getActionBarMode: jest.fn(),
}));

jest.mock("../TodoListSelectionBar", () => ({
  TodoListSelectionBar: jest.fn(({ selectedCount }: { selectedCount: number }) => (
    <div data-testid="selection-bar" data-count={selectedCount} />
  )),
}));

jest.mock("../TodoListClipboardBar", () => ({
  TodoListClipboardBar: jest.fn(({ clipboardCount }: { clipboardCount: number }) => (
    <div data-testid="clipboard-bar" data-count={clipboardCount} />
  )),
}));

import { getActionBarMode } from "../todoListActionStatusBarMode";
import { TodoListSelectionBar } from "../TodoListSelectionBar";
import { TodoListClipboardBar } from "../TodoListClipboardBar";
import { TodoListActionStatusBar } from "../TodoListActionStatusBar";

const defaultProps = {
  hasSelection: false,
  hasClipboard: false,
  selectedCount: 0,
  clipboardCount: 0,
  onCutAction: jest.fn(),
  onClearSelectionAction: jest.fn(),
  onPasteAction: jest.fn(),
  onClearClipboardAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListActionStatusBar", () => {
  describe("getActionBarMode の呼び出し", () => {
    it("hasSelection・hasClipboard を getActionBarMode に渡す", () => {
      (getActionBarMode as jest.Mock).mockReturnValue("none");
      render(
        <TodoListActionStatusBar {...defaultProps} hasSelection hasClipboard />,
      );
      expect(getActionBarMode).toHaveBeenCalledWith(true, true);
    });

    it("hasSelection=false・hasClipboard=false で getActionBarMode を呼ぶ", () => {
      (getActionBarMode as jest.Mock).mockReturnValue("none");
      render(<TodoListActionStatusBar {...defaultProps} />);
      expect(getActionBarMode).toHaveBeenCalledWith(false, false);
    });
  });

  describe("mode='none' のとき", () => {
    beforeEach(() => (getActionBarMode as jest.Mock).mockReturnValue("none"));

    it("何も表示しない", () => {
      const { container } = render(<TodoListActionStatusBar {...defaultProps} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("mode='selection' のとき", () => {
    beforeEach(() => (getActionBarMode as jest.Mock).mockReturnValue("selection"));

    it("TodoListSelectionBar を表示する", () => {
      render(<TodoListActionStatusBar {...defaultProps} />);
      expect(screen.getByTestId("selection-bar")).toBeInTheDocument();
      expect(screen.queryByTestId("clipboard-bar")).not.toBeInTheDocument();
    });

    it("selectedCount を TodoListSelectionBar に渡す", () => {
      render(
        <TodoListActionStatusBar {...defaultProps} selectedCount={5} />,
      );
      expect(TodoListSelectionBar).toHaveBeenCalledWith(
        expect.objectContaining({ selectedCount: 5 }),
        undefined,
      );
    });

    it("onCutAction と onClearSelectionAction を TodoListSelectionBar に渡す", () => {
      const onCutAction = jest.fn();
      const onClearSelectionAction = jest.fn();
      render(
        <TodoListActionStatusBar
          {...defaultProps}
          onCutAction={onCutAction}
          onClearSelectionAction={onClearSelectionAction}
        />,
      );
      expect(TodoListSelectionBar).toHaveBeenCalledWith(
        expect.objectContaining({ onCutAction, onClearSelectionAction }),
        undefined,
      );
    });
  });

  describe("mode='clipboard' のとき", () => {
    beforeEach(() => (getActionBarMode as jest.Mock).mockReturnValue("clipboard"));

    it("TodoListClipboardBar を表示する", () => {
      render(<TodoListActionStatusBar {...defaultProps} />);
      expect(screen.getByTestId("clipboard-bar")).toBeInTheDocument();
      expect(screen.queryByTestId("selection-bar")).not.toBeInTheDocument();
    });

    it("clipboardCount を TodoListClipboardBar に渡す", () => {
      render(
        <TodoListActionStatusBar {...defaultProps} clipboardCount={4} />,
      );
      expect(TodoListClipboardBar).toHaveBeenCalledWith(
        expect.objectContaining({ clipboardCount: 4 }),
        undefined,
      );
    });

    it("onPasteAction と onClearClipboardAction を TodoListClipboardBar に渡す", () => {
      const onPasteAction = jest.fn();
      const onClearClipboardAction = jest.fn();
      render(
        <TodoListActionStatusBar
          {...defaultProps}
          onPasteAction={onPasteAction}
          onClearClipboardAction={onClearClipboardAction}
        />,
      );
      expect(TodoListClipboardBar).toHaveBeenCalledWith(
        expect.objectContaining({ onPasteAction, onClearClipboardAction }),
        undefined,
      );
    });
  });
});
