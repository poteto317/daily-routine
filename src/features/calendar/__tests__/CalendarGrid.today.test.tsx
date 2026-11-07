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

  // Jest は React Compiler を通らないので、このテストは固定（メモ化）の退行を検出しない。
  // 固定の検出は src/__tests__/reactCompilerToday.contract.test.ts（契約テスト）と、共通フックの配線テストが担う
  it("日をまたいだ後の再描画で、強調と押せる日が新しい今日に移る", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T23:59:00+09:00"));
    const props = {
      year: 2026,
      month: 8,
      monthHistory: {},
      pomodoroHistory: {},
      selectedDate: null,
      onDateClick: jest.fn(),
    };
    const { rerender } = render(<CalendarGrid {...props} />);
    expect(getHighlightedDay()).toBe("13");
    expect(screen.getByRole("button", { name: "14" })).toBeDisabled();

    jest.setSystemTime(new Date("2026-08-14T00:01:00+09:00"));
    rerender(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("14");
    expect(screen.getByRole("button", { name: "14" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "15" })).toBeDisabled();
  });
});
