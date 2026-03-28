import { fireEvent, render, screen } from "@testing-library/react";
import { setupStatisticsMocks } from "./StatisticsPage.testUtils";
import { StatisticsPage } from "../StatisticsPage";
import * as statistics from "@/features/statistics/statistics";

describe("StatisticsPage mode switching", () => {
  beforeEach(setupStatisticsMocks);
  afterEach(() => jest.useRealTimers());

  it("週次→月次→カテゴリ別→週次と切り替えられる", () => {
    render(<StatisticsPage />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    fireEvent.click(screen.getByText("📆 月次"));
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    fireEvent.click(screen.getByText("🏷️ カテゴリ別"));
    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
    fireEvent.click(screen.getByText("📅 週次"));
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("選択中モードのボタンにアクティブスタイルが付く", () => {
    render(<StatisticsPage />);
    const weekButton = screen.getByText("📅 週次");
    expect(weekButton.className).toContain("bg-blue-600");
    fireEvent.click(screen.getByText("📆 月次"));
    expect(screen.getByText("📆 月次").className).toContain("bg-blue-600");
    expect(weekButton.className).not.toContain("bg-blue-600");
  });

  it("今週ボタンで現在期間へ戻る", () => {
    render(<StatisticsPage />);
    const prevButton = screen
      .getAllByRole("button")
      .find((btn) => btn.querySelector('svg path[d="M15 19l-7-7 7-7"]'));
    fireEvent.click(prevButton!);
    fireEvent.click(screen.getByText("今週"));
    expect(statistics.calculateWeeklyStats).toHaveBeenCalledTimes(3);
  });
});
