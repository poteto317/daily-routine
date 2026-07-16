import { render, screen } from "@testing-library/react";

jest.mock("../useTodoListDetailState", () => ({
  useTodoListDetailState: jest.fn(),
}));

jest.mock("../useTodoListUndoRedoKeyboard", () => ({
  useTodoListUndoRedoKeyboard: jest.fn(),
}));

jest.mock("../TodoListDetailView", () => ({
  TodoListDetailView: jest.fn(({ historyControls }) => (
    <div data-testid="detail-view">{historyControls}</div>
  )),
}));

jest.mock("../TodoListNoSelectionView", () => ({
  TodoListNoSelectionView: jest.fn(() => (
    <div data-testid="no-selection-view" />
  )),
}));

jest.mock("../TodoListUndoRedoControls", () => ({
  TodoListUndoRedoControls: jest.fn(() => (
    <div data-testid="undo-redo-controls" />
  )),
}));

import { useTodoListDetailState } from "../useTodoListDetailState";
import { useTodoListUndoRedoKeyboard } from "../useTodoListUndoRedoKeyboard";
import { TodoListDetailView } from "../TodoListDetailView";
import { TodoListUndoRedoControls } from "../TodoListUndoRedoControls";
import { TodoListDetail } from "../TodoListDetail";

const baseList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

const undo = jest.fn();
const redo = jest.fn();
const detailHandlers = { onAddItem: jest.fn() };

const defaultProps = {
  listId: "list-1",
  categories: [],
  clipboardItems: [],
  onSetClipboard: jest.fn(),
  onClearClipboard: jest.fn(),
};

describe("TodoListDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailState as jest.Mock).mockReturnValue({
      list: baseList,
      detailHandlers,
      undo,
      redo,
      canUndo: false,
      canRedo: true,
    });
  });

  describe("useTodoListDetailState の呼び出し", () => {
    it("listId を渡して useTodoListDetailState を呼ぶ", () => {
      render(<TodoListDetail {...defaultProps} />);
      expect(useTodoListDetailState).toHaveBeenCalledWith("list-1");
    });

    it("listId が変わると新しい listId で呼ばれる", () => {
      const { rerender } = render(<TodoListDetail {...defaultProps} />);
      rerender(<TodoListDetail {...defaultProps} listId="list-2" />);
      expect(useTodoListDetailState).toHaveBeenCalledWith("list-2");
    });
  });

  describe("useTodoListUndoRedoKeyboard の呼び出し", () => {
    it("state の undo/redo を useTodoListUndoRedoKeyboard に渡す", () => {
      render(<TodoListDetail {...defaultProps} />);
      expect(useTodoListUndoRedoKeyboard).toHaveBeenCalledWith({ undo, redo });
    });

    it("list が null でも useTodoListUndoRedoKeyboard は呼ばれる", () => {
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: null,
        detailHandlers: null,
        undo,
        redo,
        canUndo: false,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(useTodoListUndoRedoKeyboard).toHaveBeenCalledWith({ undo, redo });
    });

    it("undo/redo の参照が state から取り出されて渡される", () => {
      const undo2 = jest.fn();
      const redo2 = jest.fn();
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: baseList,
        detailHandlers,
        undo: undo2,
        redo: redo2,
        canUndo: true,
        canRedo: true,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(useTodoListUndoRedoKeyboard).toHaveBeenCalledWith({
        undo: undo2,
        redo: redo2,
      });
    });
  });

  describe("null ガード", () => {
    it("list が null の場合 TodoListNoSelectionView を表示する", () => {
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: null,
        detailHandlers: null,
        undo,
        redo,
        canUndo: false,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(screen.getByTestId("no-selection-view")).toBeInTheDocument();
      expect(screen.queryByTestId("detail-view")).not.toBeInTheDocument();
    });

    it("detailHandlers が null の場合 TodoListNoSelectionView を表示する", () => {
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: baseList,
        detailHandlers: null,
        undo,
        redo,
        canUndo: false,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(screen.getByTestId("no-selection-view")).toBeInTheDocument();
    });

    it("list と detailHandlers が両方 null の場合 TodoListNoSelectionView を表示する", () => {
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: null,
        detailHandlers: null,
        undo,
        redo,
        canUndo: false,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(screen.getByTestId("no-selection-view")).toBeInTheDocument();
      expect(screen.queryByTestId("detail-view")).not.toBeInTheDocument();
    });
  });

  describe("正常系: TodoListDetailView の描画", () => {
    it("TodoListDetailView を表示する", () => {
      render(<TodoListDetail {...defaultProps} />);
      expect(screen.getByTestId("detail-view")).toBeInTheDocument();
    });

    it("TodoListDetailView に historyControls として TodoListUndoRedoControls を渡す", () => {
      render(<TodoListDetail {...defaultProps} />);
      expect(screen.getByTestId("undo-redo-controls")).toBeInTheDocument();
      expect(TodoListDetailView).toHaveBeenCalledWith(
        expect.objectContaining({ historyControls: expect.anything() }),
        undefined,
      );
    });

    it("TodoListUndoRedoControls に state の undo/redo/canUndo/canRedo を渡す", () => {
      render(<TodoListDetail {...defaultProps} />);
      expect(TodoListUndoRedoControls).toHaveBeenCalledWith(
        expect.objectContaining({
          onUndo: undo,
          onRedo: redo,
          canUndo: false,
          canRedo: true,
        }),
        undefined,
      );
    });

    it("canUndo=true のとき TodoListUndoRedoControls に伝播する", () => {
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: baseList,
        detailHandlers,
        undo,
        redo,
        canUndo: true,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(TodoListUndoRedoControls).toHaveBeenCalledWith(
        expect.objectContaining({ canUndo: true, canRedo: false }),
        undefined,
      );
    });

    it("detailHandlers の各ハンドラーが TodoListDetailView に個別 props として渡る", () => {
      const onAddItem = jest.fn();
      const onToggleItem = jest.fn();
      const richHandlers = { onAddItem, onToggleItem };
      (useTodoListDetailState as jest.Mock).mockReturnValue({
        list: baseList,
        detailHandlers: richHandlers,
        undo,
        redo,
        canUndo: false,
        canRedo: false,
      });
      render(<TodoListDetail {...defaultProps} />);
      expect(TodoListDetailView).toHaveBeenCalledWith(
        expect.objectContaining({ onAddItem, onToggleItem }),
        undefined,
      );
    });

    it("clipboardItems/onSetClipboard/onClearClipboard を TodoListDetailView にそのまま渡す", () => {
      const clipboardItem = { id: "c-1" } as never;
      const onSetClipboard = jest.fn();
      const onClearClipboard = jest.fn();
      render(
        <TodoListDetail
          {...defaultProps}
          clipboardItems={[clipboardItem]}
          onSetClipboard={onSetClipboard}
          onClearClipboard={onClearClipboard}
        />,
      );
      expect(TodoListDetailView).toHaveBeenCalledWith(
        expect.objectContaining({
          clipboardItems: [clipboardItem],
          onSetClipboard,
          onClearClipboard,
        }),
        undefined,
      );
    });

    it("categories を TodoListDetailView にそのまま渡す", () => {
      const categories = [
        { id: "cat-1", name: "仕事", createdAt: "2026-03-07T00:00:00.000Z" },
      ];
      render(<TodoListDetail {...defaultProps} categories={categories} />);
      expect(TodoListDetailView).toHaveBeenCalledWith(
        expect.objectContaining({ categories }),
        undefined,
      );
    });
  });
});
