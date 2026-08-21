import { render, screen } from "@testing-library/react";
import { WeeklyGoalsPanel } from "../page/components/WeeklyGoalsPanel";
import type { WeeklyGoalProgress } from "../statistics/types";

const progress = (
  overrides: Partial<WeeklyGoalProgress> = {},
): WeeklyGoalProgress => ({
  goalId: "exercise",
  title: "運動",
  targetPerWeek: 3,
  completedCount: 2,
  remainingCount: 1,
  isAchieved: false,
  currentStreak: 4,
  longestStreak: 7,
  ...overrides,
});

describe("WeeklyGoalsPanel", () => {
  it("進捗、残り回数、現在と最長ストリークを表示する", () => {
    render(<WeeklyGoalsPanel goals={[progress()]} />);

    expect(
      screen.getByRole("heading", { name: "週間目標" }),
    ).toBeInTheDocument();
    expect(screen.getByText("運動")).toBeInTheDocument();
    expect(screen.getByText("2 / 3回")).toBeInTheDocument();
    expect(screen.getByText("あと1回")).toBeInTheDocument();
    expect(screen.getByText("現在 4週")).toBeInTheDocument();
    expect(screen.getByText("最長 7週")).toBeInTheDocument();

    const progressbar = screen.getByRole("progressbar", { name: "運動の進捗" });
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar).toHaveAttribute("aria-valuemax", "3");
  });

  it("達成済みをチェックと達成表示で強調する", () => {
    render(
      <WeeklyGoalsPanel
        goals={[
          progress({
            completedCount: 3,
            remainingCount: 0,
            isAchieved: true,
          }),
        ]}
      />,
    );

    expect(screen.getByText("✓ 達成")).toBeInTheDocument();
    expect(screen.queryByText(/あと/)).not.toBeInTheDocument();
  });

  it("完了回数が目標を超えても進捗バーのARIA値を上限内に保つ", () => {
    render(
      <WeeklyGoalsPanel
        goals={[
          progress({
            completedCount: 5,
            remainingCount: 0,
            isAchieved: true,
          }),
        ]}
      />,
    );

    const progressbar = screen.getByRole("progressbar", {
      name: "運動の進捗",
    });
    expect(progressbar).toHaveAttribute("aria-valuenow", "3");
    expect(progressbar).toHaveAttribute("aria-valuemax", "3");
    expect(progressbar).toHaveAttribute("aria-valuetext", "5 / 3回");
  });

  it("対象目標がない週は空状態を表示する", () => {
    render(<WeeklyGoalsPanel goals={[]} />);

    expect(
      screen.getByText("この週に設定された週間目標はありません"),
    ).toBeInTheDocument();
  });
});
