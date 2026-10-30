import { fireEvent, render, screen } from "@testing-library/react";
import { StatisticsPeriodControls } from "../page/components/StatisticsPeriodControls";

const PREVIOUS_PATH = "M15 19l-7-7 7-7";
const NEXT_PATH = "M9 5l7 7-7 7";

const renderControls = () => {
  const handlers = {
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onToday: jest.fn(),
  };
  render(
    <StatisticsPeriodControls
      viewMode="week"
      periodLabel="2025年6月1日〜7日"
      {...handlers}
    />,
  );
  return {
    handlers,
    previousButton: screen.getByRole("button", { name: "前の期間へ" }),
    nextButton: screen.getByRole("button", { name: "次の期間へ" }),
  };
};

describe("StatisticsPeriodControls 前後ボタン", () => {
  it("前後ボタンに type=button と aria-label が付く", () => {
    const { previousButton, nextButton } = renderControls();

    expect(previousButton).toHaveAttribute("type", "button");
    expect(previousButton).toHaveAttribute("aria-label", "前の期間へ");
    expect(nextButton).toHaveAttribute("type", "button");
    expect(nextButton).toHaveAttribute("aria-label", "次の期間へ");
  });

  it("前ボタンは onPrevious だけを呼ぶ", () => {
    const { handlers, previousButton } = renderControls();

    fireEvent.click(previousButton);

    expect(handlers.onPrevious).toHaveBeenCalledTimes(1);
    expect(handlers.onNext).not.toHaveBeenCalled();
    expect(handlers.onToday).not.toHaveBeenCalled();
  });

  it("次ボタンは onNext だけを呼ぶ", () => {
    const { handlers, nextButton } = renderControls();

    fireEvent.click(nextButton);

    expect(handlers.onNext).toHaveBeenCalledTimes(1);
    expect(handlers.onPrevious).not.toHaveBeenCalled();
    expect(handlers.onToday).not.toHaveBeenCalled();
  });

  it("前後ボタンの矢印の path が正しい", () => {
    const { previousButton, nextButton } = renderControls();

    expect(previousButton.querySelector("path")).toHaveAttribute(
      "d",
      PREVIOUS_PATH,
    );
    expect(nextButton.querySelector("path")).toHaveAttribute("d", NEXT_PATH);
  });
});
