import { render, screen } from "@testing-library/react";
import { CalendarGrid } from "../components/CalendarGrid";

const renderGrid = () =>
  render(
    <CalendarGrid
      year={2026}
      month={8}
      monthHistory={{}}
      pomodoroHistory={{}}
      selectedDate={null}
      onDateClick={jest.fn()}
    />,
  );

/** 「今日」として強調されている日を返す */
const getHighlightedDay = () =>
  screen
    .getAllByRole("button")
    .find((button) => button.className.includes("ring"))
    ?.textContent?.trim();

describe("CalendarGrid の今日判定", () => {
  afterEach(() => jest.useRealTimers());

  it("日本時間の朝でも当日を強調する", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC。
    // UTC 基準だと前日のセルが強調されてしまう
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    renderGrid();

    expect(getHighlightedDay()).toBe("13");
  });

  it("日本時間の夜も当日を強調する", () => {
    // 2026-08-13 20:00 JST = 2026-08-13 11:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T11:00:00Z"));

    renderGrid();

    expect(getHighlightedDay()).toBe("13");
  });
});
