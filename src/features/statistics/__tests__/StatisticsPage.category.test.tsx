import { fireEvent, render, screen } from "@testing-library/react";
import { setupStatisticsMocks } from "./StatisticsPage.testUtils";
import { StatisticsPage } from "../StatisticsPage";
import * as statistics from "@/features/statistics/statistics";

describe("StatisticsPage category mode", () => {
  beforeEach(setupStatisticsMocks);
  afterEach(() => jest.useRealTimers());

  it("カテゴリ別表示でドーナツと詳細を表示する", () => {
    render(<StatisticsPage />);
    fireEvent.click(screen.getByText("🏷️ カテゴリ別"));
    expect(screen.getByText(/のカテゴリ別達成状況/)).toBeInTheDocument();
    expect(screen.getByText("3 カテゴリ")).toBeInTheDocument();
    expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
    expect(screen.getByText("健康")).toBeInTheDocument();
    expect(screen.getByText("仕事")).toBeInTheDocument();
    expect(screen.getByText("勉強")).toBeInTheDocument();
    expect(screen.queryByText("今週")).not.toBeInTheDocument();
    expect(screen.queryByText("今月")).not.toBeInTheDocument();
  });

  it("カテゴリデータがない場合に空表示メッセージ", () => {
    (statistics.calculateCategoryStats as jest.Mock).mockReturnValue([]);
    render(<StatisticsPage />);
    fireEvent.click(screen.getByText("🏷️ カテゴリ別"));
    expect(
      screen.getByText("カテゴリ別のデータがありません"),
    ).toBeInTheDocument();
  });
});
