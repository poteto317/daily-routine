import { fireEvent, render } from "@testing-library/react";
import { CalendarMonthNavigation } from "../components/CalendarMonthNavigation";

const PREVIOUS_PATH = "M15 19l-7-7 7-7";
const NEXT_PATH = "M9 5l7 7-7 7";

const renderNavigation = () => {
  const handlers = {
    onGoToToday: jest.fn(),
    onNextMonth: jest.fn(),
    onPreviousMonth: jest.fn(),
  };
  const { container } = render(
    <CalendarMonthNavigation month={5} year={2025} {...handlers} />,
  );
  const [previousButton, , nextButton] = Array.from(
    container.querySelectorAll("button"),
  );
  return { handlers, previousButton, nextButton };
};

describe("CalendarMonthNavigation 前後ボタン", () => {
  it("前後ボタンには type と aria-label が付かない", () => {
    const { previousButton, nextButton } = renderNavigation();

    for (const button of [previousButton, nextButton]) {
      expect(button).not.toHaveAttribute("type");
      expect(button).not.toHaveAttribute("aria-label");
    }
  });

  it("前ボタンは onPreviousMonth だけを呼ぶ", () => {
    const { handlers, previousButton } = renderNavigation();

    fireEvent.click(previousButton);

    expect(handlers.onPreviousMonth).toHaveBeenCalledTimes(1);
    expect(handlers.onNextMonth).not.toHaveBeenCalled();
    expect(handlers.onGoToToday).not.toHaveBeenCalled();
  });

  it("次ボタンは onNextMonth だけを呼ぶ", () => {
    const { handlers, nextButton } = renderNavigation();

    fireEvent.click(nextButton);

    expect(handlers.onNextMonth).toHaveBeenCalledTimes(1);
    expect(handlers.onPreviousMonth).not.toHaveBeenCalled();
    expect(handlers.onGoToToday).not.toHaveBeenCalled();
  });

  it("前後ボタンの矢印の path が正しい", () => {
    const { previousButton, nextButton } = renderNavigation();

    expect(previousButton.querySelector("path")).toHaveAttribute(
      "d",
      PREVIOUS_PATH,
    );
    expect(nextButton.querySelector("path")).toHaveAttribute("d", NEXT_PATH);
  });
});
