import { render, screen, fireEvent } from "@testing-library/react";
import { TodoListSelectionBar } from "../TodoListSelectionBar";

const defaultProps = {
  selectedCount: 2,
  onCutAction: jest.fn(),
  onClearSelectionAction: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoListSelectionBar", () => {
  it("選択件数を表示する", () => {
    render(<TodoListSelectionBar {...defaultProps} />);
    expect(screen.getByText("2件選択中")).toBeInTheDocument();
  });

  it("1件の場合も正しく表示する", () => {
    render(<TodoListSelectionBar {...defaultProps} selectedCount={1} />);
    expect(screen.getByText("1件選択中")).toBeInTheDocument();
  });

  it("切り取りボタンクリックで onCutAction が呼ばれる", () => {
    render(<TodoListSelectionBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /切り取り/ }));
    expect(defaultProps.onCutAction).toHaveBeenCalledTimes(1);
  });

  it("選択解除ボタンクリックで onClearSelectionAction が呼ばれる", () => {
    render(<TodoListSelectionBar {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "選択解除" }));
    expect(defaultProps.onClearSelectionAction).toHaveBeenCalledTimes(1);
  });
});
