import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemIndentButtons } from "../TodoItemIndentButtons";

const defaultProps = {
  listId: "list-1",
  itemId: "item-1",
  currentIndent: 1,
  maxIndent: 3,
  onIndent: jest.fn(),
  onOutdent: jest.fn(),
};

describe("TodoItemIndentButtons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("インデント上げ・下げボタンを表示する", () => {
    render(<TodoItemIndentButtons {...defaultProps} />);
    expect(screen.getByLabelText("インデントを下げる")).toBeInTheDocument();
    expect(screen.getByLabelText("インデントを上げる")).toBeInTheDocument();
  });

  it("currentIndent=0 のとき「下げる」ボタンが disabled になる", () => {
    render(<TodoItemIndentButtons {...defaultProps} currentIndent={0} />);
    expect(screen.getByLabelText("インデントを下げる")).toBeDisabled();
    expect(screen.getByLabelText("インデントを上げる")).not.toBeDisabled();
  });

  it("currentIndent >= maxIndent のとき「上げる」ボタンが disabled になる", () => {
    render(<TodoItemIndentButtons {...defaultProps} currentIndent={3} maxIndent={3} />);
    expect(screen.getByLabelText("インデントを上げる")).toBeDisabled();
    expect(screen.getByLabelText("インデントを下げる")).not.toBeDisabled();
  });

  it("「下げる」クリックで onOutdent が呼ばれる", () => {
    const onOutdent = jest.fn();
    render(<TodoItemIndentButtons {...defaultProps} onOutdent={onOutdent} />);
    fireEvent.click(screen.getByLabelText("インデントを下げる"));
    expect(onOutdent).toHaveBeenCalledWith("list-1", "item-1");
  });

  it("「上げる」クリックで onIndent が呼ばれる", () => {
    const onIndent = jest.fn();
    render(<TodoItemIndentButtons {...defaultProps} onIndent={onIndent} />);
    fireEvent.click(screen.getByLabelText("インデントを上げる"));
    expect(onIndent).toHaveBeenCalledWith("list-1", "item-1");
  });
});
