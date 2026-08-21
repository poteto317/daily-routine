import * as statistics from "@/features/statistics/statistics";

jest.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

jest.mock("chart.js", () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  ArcElement: jest.fn(),
}));

jest.mock("@/features/statistics/statistics", () => ({
  calculateWeeklyStats: jest.fn(),
  calculateMonthlyStats: jest.fn(),
  calculateCategoryStats: jest.fn(),
  calculateWeeklyGoalProgress: jest.fn(),
}));

export const defaultWeeklyStats = {
  weekStart: "2024/6/10",
  weekEnd: "2024/6/16",
  days: [
    { date: "2024-06-10", completed: 3, total: 5, achievementRate: 60 },
    { date: "2024-06-11", completed: 4, total: 5, achievementRate: 80 },
  ],
  totalCompleted: 26,
  totalRoutines: 35,
  averageAchievementRate: 74.3,
};

export const defaultMonthlyStats = {
  year: 2024,
  month: 6,
  days: [
    { date: "2024-06-01", completed: 3, total: 5, achievementRate: 60 },
    { date: "2024-06-02", completed: 5, total: 5, achievementRate: 100 },
  ],
  averageAchievementRate: 75.5,
  bestDay: { date: "2024-06-02", completed: 5, total: 5, achievementRate: 100 },
  worstDay: { date: "2024-06-01", completed: 3, total: 5, achievementRate: 60 },
  totalCompleted: 8,
  totalRoutines: 10,
};

export const defaultCategoryStats = [
  { category: "health", completed: 10, total: 15, achievementRate: 66.7 },
  { category: "work", completed: 20, total: 25, achievementRate: 80.0 },
  { category: "study", completed: 5, total: 10, achievementRate: 50.0 },
];

export const defaultWeeklyGoalProgress = [
  {
    goalId: "exercise",
    title: "運動",
    targetPerWeek: 3,
    completedCount: 2,
    remainingCount: 1,
    isAchieved: false,
    currentStreak: 4,
    longestStreak: 7,
  },
];

export const setupStatisticsMocks = () => {
  jest.clearAllMocks();
  (statistics.calculateWeeklyStats as jest.Mock).mockReturnValue(
    defaultWeeklyStats,
  );
  (statistics.calculateMonthlyStats as jest.Mock).mockReturnValue(
    defaultMonthlyStats,
  );
  (statistics.calculateCategoryStats as jest.Mock).mockReturnValue(
    defaultCategoryStats,
  );
  (statistics.calculateWeeklyGoalProgress as jest.Mock).mockReturnValue(
    defaultWeeklyGoalProgress,
  );
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2024-06-15"));
};
