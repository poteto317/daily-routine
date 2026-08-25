import { render, screen, fireEvent } from "@testing-library/react";
import { TodoItemColorSwatches } from "../TodoItemColorSwatches";
import type { TodoItemBgColorValue } from "../types";

const defaultProps = {
  selectedColor: undefined as TodoItemBgColorValue | undefined | null,
  onSelectAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoItemColorSwatches", () => {
  it("全色スウォッチを表示する", () => {
    render(<TodoItemColorSwatches {...defaultProps} />);
    // role="radio" のボタンが色の数だけある
    const swatches = screen.getAllByRole("radio");
    expect(swatches.length).toBeGreaterThan(0);
  });

  it('role="radiogroup" がある', () => {
    render(<TodoItemColorSwatches {...defaultProps} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it('selectedColor と一致するスウォッチが aria-checked="true" になる', () => {
    render(
      <TodoItemColorSwatches {...defaultProps} selectedColor="bg-red-50" />,
    );
    const checked = screen.getByRole("radio", { name: "赤" });
    expect(checked).toHaveAttribute("aria-checked", "true");
  });

  it('selectedColor が undefined のときデフォルト色が aria-checked="true" になる', () => {
    render(
      <TodoItemColorSwatches {...defaultProps} selectedColor={undefined} />,
    );
    const checked = screen.getByRole("radio", { name: "デフォルト" });
    expect(checked).toHaveAttribute("aria-checked", "true");
  });

  it('selectedColor が null のときどのスウォッチも aria-checked="true" にならない', () => {
    render(<TodoItemColorSwatches {...defaultProps} selectedColor={null} />);
    const swatches = screen.getAllByRole("radio");
    swatches.forEach((s) => expect(s).toHaveAttribute("aria-checked", "false"));
  });

  it("スウォッチクリックで onSelectAction が呼ばれる", () => {
    render(<TodoItemColorSwatches {...defaultProps} />);
    fireEvent.click(screen.getByRole("radio", { name: "赤" }));
    expect(defaultProps.onSelectAction).toHaveBeenCalledWith("bg-red-50");
  });

  it("デフォルト色スウォッチクリックで onSelectAction(undefined) が呼ばれる", () => {
    render(<TodoItemColorSwatches {...defaultProps} />);
    fireEvent.click(screen.getByRole("radio", { name: "デフォルト" }));
    expect(defaultProps.onSelectAction).toHaveBeenCalledWith(undefined);
  });

  it("className prop が radiogroup に適用される", () => {
    render(
      <TodoItemColorSwatches
        {...defaultProps}
        className="flex flex-wrap gap-1.5"
      />,
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("flex");
  });

  describe("showDefaultBorder", () => {
    it("showDefaultBorder=false のときデフォルト色に gray-400 border が付かない（デフォルト）", () => {
      render(
        <TodoItemColorSwatches
          {...defaultProps}
          selectedColor={null}
          showDefaultBorder={false}
        />,
      );
      const defaultSwatch = screen.getByRole("radio", { name: "デフォルト" });
      expect(defaultSwatch.className).not.toContain("border-gray-400");
    });

    it("showDefaultBorder=true のとき未選択のデフォルト色に gray-400 border が付く", () => {
      render(
        <TodoItemColorSwatches
          {...defaultProps}
          selectedColor={null}
          showDefaultBorder
        />,
      );
      const defaultSwatch = screen.getByRole("radio", { name: "デフォルト" });
      expect(defaultSwatch.className).toContain("border-gray-400");
    });
  });
});
