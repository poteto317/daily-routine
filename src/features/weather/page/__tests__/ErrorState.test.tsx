import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../ErrorState";
import { WEATHER_ERROR_STATE_TEXT } from "../../texts";

describe("Weather ErrorState", () => {
  it("エラー内容を表示し、リトライボタンを押下するとonRetryが呼ばれる", () => {
    const handleRetry = jest.fn();
    render(<ErrorState error="通信エラー" onRetry={handleRetry} />);

    expect(screen.getByText(new RegExp("通信エラー"))).toBeInTheDocument();

    const retryButton = screen.getByRole("button", {
      name: WEATHER_ERROR_STATE_TEXT.reload,
    });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
