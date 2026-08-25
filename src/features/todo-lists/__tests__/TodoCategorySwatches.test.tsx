import { render, screen, fireEvent } from "@testing-library/react";
import { TodoCategorySwatches } from "../TodoCategorySwatches";
import type { TodoCategory } from "../types";

const categories: TodoCategory[] = [
  { id: "cat-work", name: "仕事", color: "bg-blue-50", createdAt: "" },
  { id: "cat-private", name: "プライベート", createdAt: "" },
];

const defaultProps = {
  categories,
  selectedCategoryId: undefined as string | undefined,
  onSelectAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoCategorySwatches", () => {
  it("未分類 + 全カテゴリ分のスウォッチを表示する", () => {
    render(<TodoCategorySwatches {...defaultProps} />);
    const swatches = screen.getAllByRole("radio");
    expect(swatches).toHaveLength(3); // 未分類 + 仕事 + プライベート
  });

  it('role="radiogroup" がある', () => {
    render(<TodoCategorySwatches {...defaultProps} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it('selectedCategoryId と一致するスウォッチが aria-checked="true" になる', () => {
    render(
      <TodoCategorySwatches {...defaultProps} selectedCategoryId="cat-work" />,
    );
    const checked = screen.getByRole("radio", { name: "仕事" });
    expect(checked).toHaveAttribute("aria-checked", "true");
  });

  it('selectedCategoryId が undefined のとき未分類が aria-checked="true" になる', () => {
    render(
      <TodoCategorySwatches {...defaultProps} selectedCategoryId={undefined} />,
    );
    const checked = screen.getByRole("radio", { name: "未分類" });
    expect(checked).toHaveAttribute("aria-checked", "true");
  });

  it("カテゴリスウォッチクリックで onSelectAction がそのカテゴリIDで呼ばれる", () => {
    render(<TodoCategorySwatches {...defaultProps} />);
    fireEvent.click(screen.getByRole("radio", { name: "仕事" }));
    expect(defaultProps.onSelectAction).toHaveBeenCalledWith("cat-work");
  });

  it("未分類スウォッチクリックで onSelectAction(undefined) が呼ばれる", () => {
    render(
      <TodoCategorySwatches {...defaultProps} selectedCategoryId="cat-work" />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "未分類" }));
    expect(defaultProps.onSelectAction).toHaveBeenCalledWith(undefined);
  });

  it('selectedCategoryId が categories に存在しない（削除済みなど）とき未分類が aria-checked="true" になる（レビュー指摘対応）', () => {
    render(
      <TodoCategorySwatches
        {...defaultProps}
        selectedCategoryId="cat-deleted"
      />,
    );
    expect(screen.getByRole("radio", { name: "未分類" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it('selectedCategoryId が categories に存在しないとき、実在するカテゴリのスウォッチは aria-checked="false" のままになる', () => {
    render(
      <TodoCategorySwatches
        {...defaultProps}
        selectedCategoryId="cat-deleted"
      />,
    );
    expect(screen.getByRole("radio", { name: "仕事" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("radio", { name: "プライベート" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("categoriesが空でも未分類スウォッチは表示される", () => {
    render(<TodoCategorySwatches {...defaultProps} categories={[]} />);
    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "未分類" })).toBeInTheDocument();
  });

  it("className prop が radiogroup に適用される", () => {
    render(
      <TodoCategorySwatches
        {...defaultProps}
        className="flex flex-wrap gap-1.5"
      />,
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("flex");
  });
});
