import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuIndentControls } from "../TodoItemActionMenuIndentControls";

describe("TodoItemActionMenuIndentControls", () => {
  const defaultProps = {
    currentIndent: 1,
    maxIndent: 3,
    sortModeActive: false,
    onOutdent: jest.fn(),
    onIndent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("インデントを下げる/上げるボタンを表示する", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeInTheDocument();
  });

  it("下げるボタンクリックで onOutdent が呼ばれる", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを下げる/ }));
    expect(defaultProps.onOutdent).toHaveBeenCalledTimes(1);
  });

  it("上げるボタンクリックで onIndent が呼ばれる", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを上げる/ }));
    expect(defaultProps.onIndent).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が 0 のとき下げるボタンは disabled", () => {
    render(
      <TodoItemActionMenuIndentControls {...defaultProps} currentIndent={0} />,
    );
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeDisabled();
  });

  it("currentIndent が maxIndent 以上のとき上げるボタンは disabled", () => {
    render(
      <TodoItemActionMenuIndentControls
        {...defaultProps}
        currentIndent={3}
        maxIndent={3}
      />,
    );
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeDisabled();
  });

  it("sortModeActive のとき両方 disabled になり、クリックしても呼ばれない", () => {
    render(
      <TodoItemActionMenuIndentControls
        {...defaultProps}
        sortModeActive={true}
      />,
    );
    const outdentButton = screen.getByRole("button", {
      name: /インデントを下げる/,
    });
    const indentButton = screen.getByRole("button", {
      name: /インデントを上げる/,
    });
    expect(outdentButton).toBeDisabled();
    expect(indentButton).toBeDisabled();

    fireEvent.click(outdentButton);
    fireEvent.click(indentButton);
    expect(defaultProps.onOutdent).not.toHaveBeenCalled();
    expect(defaultProps.onIndent).not.toHaveBeenCalled();
  });
});
