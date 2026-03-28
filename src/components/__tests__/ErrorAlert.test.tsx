import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorAlert } from "../ErrorAlert";

describe("ErrorAlert", () => {
  it("エラーのみを表示できる", () => {
    render(<ErrorAlert error="通信エラー" />);

    expect(screen.getByText("通信エラー")).toBeInTheDocument();
    expect(screen.queryByText("再試行")).not.toBeInTheDocument();
  });

  it("再試行ボタンを表示して押下できる", () => {
    const onRetry = jest.fn();
    render(
      <ErrorAlert error="失敗しました" onRetry={onRetry} retryButtonText="再実行" />,
    );

    fireEvent.click(screen.getByText("再実行"));
    expect(onRetry).toHaveBeenCalled();
  });
});
