import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { CalendarGrid } from "../components/CalendarGrid";

const props = {
  year: 2026,
  month: 8,
  monthHistory: {},
  pomodoroHistory: {},
  selectedDate: null,
  onDateClick: jest.fn(),
};

/** 「今日」として強調されている日を返す */
const getHighlightedDay = () =>
  screen
    .getAllByRole("button")
    .find((button) => button.className.includes("ring"))
    ?.textContent?.trim();

// 今日の判定（強調と押せるかどうか）は、共通フック useJstTodayKey の値で決める。
// 時計（2026-08-13）と違う日をフックから返し、フックの値が使われることを確かめる
describe("CalendarGrid の今日は共通フック useJstTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T12:00:00+09:00"));
    (useJstTodayKey as jest.Mock).mockReturnValue("2026-08-20");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの日付を強調し、その日まで押せて翌日から押せない", () => {
    render(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("20");
    expect(screen.getByRole("button", { name: "20" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "21" })).toBeDisabled();
  });

  it("再描画でフックの日付が変わると、強調と押せる日が追いつく", () => {
    const { rerender } = render(<CalendarGrid {...props} />);

    (useJstTodayKey as jest.Mock).mockReturnValue("2026-08-21");
    rerender(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("21");
    expect(screen.getByRole("button", { name: "21" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "22" })).toBeDisabled();
  });
});
