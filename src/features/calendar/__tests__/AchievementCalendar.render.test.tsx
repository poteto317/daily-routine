import { screen } from "@testing-library/react";
import {
  renderCalendar,
  setupCalendarTest,
} from "./achievementCalendarTestUtils";
import calendarTexts from "../locales/ja.json";

describe("AchievementCalendar render", () => {
  setupCalendarTest();

  it("初期表示が正しくレンダリングされる", () => {
    renderCalendar();

    expect(
      screen.getByText(calendarTexts.page.title),
    ).toBeInTheDocument();
    expect(screen.getByText("2024年 6月")).toBeInTheDocument();
    expect(
      screen.getByText(calendarTexts.monthNavigation.goToToday),
    ).toBeInTheDocument();
  });

  it("曜日ヘッダーと凡例が表示される", () => {
    renderCalendar();

    calendarTexts.weekHeader.weekDays.forEach((label: string) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    calendarTexts.legend.items.forEach((item: { label: string }) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("当月の日付がすべて表示される", () => {
    renderCalendar();

    for (let day = 1; day <= 30; day++) {
      expect(screen.getByText(day.toString())).toBeInTheDocument();
    }
  });
});
