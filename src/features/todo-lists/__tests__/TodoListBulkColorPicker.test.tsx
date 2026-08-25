import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListBulkColorPicker } from "../TodoListBulkColorPicker";
import type { TodoListItem } from "../types";

const makeItem = (id: string, bgColor?: string): TodoListItem => ({
  id,
  title: `Item ${id}`,
  isCompleted: false,
  bgColor: bgColor as TodoListItem["bgColor"],
  createdAt: "2024-01-01",
});

const baseProps = {
  items: [],
  showBulkColorPicker: false,
  onToggleAction: jest.fn(),
  onCloseAction: jest.fn(),
  onUpdateAllItemsBgColorAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListBulkColorPicker", () => {
  it("一括背景色ボタンが表示される", () => {
    render(<TodoListBulkColorPicker {...baseProps} />);
    expect(
      screen.getByRole("button", { name: "一括背景色変更" }),
    ).toBeInTheDocument();
  });

  it("showBulkColorPicker=false のときピッカーが表示されない", () => {
    render(
      <TodoListBulkColorPicker {...baseProps} showBulkColorPicker={false} />,
    );
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("showBulkColorPicker=true のときピッカーが表示される", () => {
    render(<TodoListBulkColorPicker {...baseProps} showBulkColorPicker />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("ボタンクリックで onToggleAction が呼ばれる", () => {
    render(<TodoListBulkColorPicker {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "一括背景色変更" }));
    expect(baseProps.onToggleAction).toHaveBeenCalledTimes(1);
  });

  it("色を選択すると onUpdateAllItemsBgColorAction と onCloseAction が呼ばれる", () => {
    render(
      <TodoListBulkColorPicker
        {...baseProps}
        showBulkColorPicker
        items={[makeItem("1"), makeItem("2")]}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "赤" }));
    expect(baseProps.onUpdateAllItemsBgColorAction).toHaveBeenCalledWith(
      "bg-red-50",
    );
    expect(baseProps.onCloseAction).toHaveBeenCalledTimes(1);
  });

  describe("bulkSelected 計算", () => {
    it('全アイテムが同一色の場合そのスウォッチが aria-checked="true"', () => {
      render(
        <TodoListBulkColorPicker
          {...baseProps}
          showBulkColorPicker
          items={[makeItem("1", "bg-red-50"), makeItem("2", "bg-red-50")]}
        />,
      );
      expect(screen.getByRole("radio", { name: "赤" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it('全アイテムがデフォルト色の場合デフォルトスウォッチが aria-checked="true"', () => {
      render(
        <TodoListBulkColorPicker
          {...baseProps}
          showBulkColorPicker
          items={[makeItem("1"), makeItem("2")]}
        />,
      );
      expect(screen.getByRole("radio", { name: "デフォルト" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it('色が混在する場合どのスウォッチも aria-checked="true" にならない', () => {
      render(
        <TodoListBulkColorPicker
          {...baseProps}
          showBulkColorPicker
          items={[makeItem("1", "bg-red-50"), makeItem("2", "bg-blue-50")]}
        />,
      );
      const swatches = screen.getAllByRole("radio");
      swatches.forEach((s) =>
        expect(s).toHaveAttribute("aria-checked", "false"),
      );
    });

    it('アイテムが 0 件の場合どのスウォッチも aria-checked="true" にならない', () => {
      render(
        <TodoListBulkColorPicker
          {...baseProps}
          showBulkColorPicker
          items={[]}
        />,
      );
      const swatches = screen.getAllByRole("radio");
      swatches.forEach((s) =>
        expect(s).toHaveAttribute("aria-checked", "false"),
      );
    });
  });
});
