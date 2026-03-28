import { fireEvent, render, screen } from "@testing-library/react";
import { setupStatisticsMocks } from "./StatisticsPage.testUtils";
import { StatisticsPage } from "../StatisticsPage";
import * as statistics from "@/features/statistics/statistics";

describe("StatisticsPage initial and weekly", () => {
  beforeEach(setupStatisticsMocks);
  afterEach(() => jest.useRealTimers());

  it("初期表示で週次情報と棒グラフを表示する", () => {
    render(<StatisticsPage />);
    expect(screen.getByText("📊 統計・レポート")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの達成記録を分析します"),
    ).toBeInTheDocument();
    expect(screen.getByText("📅 週次")).toBeInTheDocument();
    expect(screen.getByText("📆 月次")).toBeInTheDocument();
    expect(screen.getByText("🏷️ カテゴリ別")).toBeInTheDocument();
    expect(screen.getByText("週平均達成率")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByText("74.3%")).toBeInTheDocument();
    expect(screen.getByText("2024/6/10 〜 2024/6/16")).toBeInTheDocument();
    expect(screen.getByText("今週")).toBeInTheDocument();
  });

  it("前週・翌週移動で再計算される", () => {
    render(<StatisticsPage />);
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((btn) =>
      btn.querySelector('svg path[d="M15 19l-7-7 7-7"]'),
    );
    const nextButton = buttons.find((btn) =>
      btn.querySelector('svg path[d="M9 5l7 7-7 7"]'),
    );
    fireEvent.click(prevButton!);
    fireEvent.click(nextButton!);
    expect(statistics.calculateWeeklyStats).toHaveBeenCalledTimes(3);
  });
});
