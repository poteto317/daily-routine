import { fireEvent, render, screen } from "@testing-library/react";
import {
  defaultMonthlyStats,
  setupStatisticsMocks,
} from "./StatisticsPage.testUtils";
import { StatisticsPage } from "../StatisticsPage";
import * as statistics from "@/features/statistics/statistics";

describe("StatisticsPage monthly mode", () => {
  beforeEach(setupStatisticsMocks);
  afterEach(() => jest.useRealTimers());

  it("月次表示で統計・グラフ・文言を表示する", () => {
    render(<StatisticsPage />);
    fireEvent.click(screen.getByText("📆 月次"));
    expect(screen.getByText("月平均達成率")).toBeInTheDocument();
    expect(screen.getByText("最高達成日")).toBeInTheDocument();
    expect(screen.getByText("最低達成日")).toBeInTheDocument();
    expect(screen.getByText("75.5%")).toBeInTheDocument();
    expect(screen.getByText("2日 (100.0%)")).toBeInTheDocument();
    expect(screen.getByText("1日 (60.0%)")).toBeInTheDocument();
    expect(screen.getByText("今月")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("best/worstがない場合はデータなしを表示する", () => {
    (statistics.calculateMonthlyStats as jest.Mock).mockReturnValue({
      ...defaultMonthlyStats,
      bestDay: null,
      worstDay: null,
    });
    render(<StatisticsPage />);
    fireEvent.click(screen.getByText("📆 月次"));
    expect(screen.getAllByText("データなし")).toHaveLength(2);
  });

  it("前月移動で再計算される", () => {
    render(<StatisticsPage />);
    fireEvent.click(screen.getByText("📆 月次"));
    const prevButton = screen
      .getAllByRole("button")
      .find((btn) => btn.querySelector('svg path[d="M15 19l-7-7 7-7"]'));
    fireEvent.click(prevButton!);
    expect(statistics.calculateMonthlyStats).toHaveBeenCalledTimes(2);
  });
});
