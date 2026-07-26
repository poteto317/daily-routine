import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetSummaryPage } from "../components/BudgetSummaryPage";

jest.mock("../useBudgetSummaryPageState", () => ({
  useBudgetSummaryPageState: jest.fn(),
}));

jest.mock("@/features/routine/pages/NavigationContext", () => ({
  useNavigationContext: jest.fn(() => jest.fn()),
}));

import { useBudgetSummaryPageState } from "../useBudgetSummaryPageState";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";

const mockUsePageState = useBudgetSummaryPageState as jest.MockedFunction<
  typeof useBudgetSummaryPageState
>;
const mockUseNavigationContext = useNavigationContext as jest.MockedFunction<
  typeof useNavigationContext
>;

const defaultMonthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  currentDate: new Date("2026-03-07T00:00:00+09:00"),
  dailyBudget: 6333,
  expenseCount: 5,
  goToCurrentMonth: jest.fn(),
  goToNextMonth: jest.fn(),
  goToPreviousMonth: jest.fn(),
  isCurrentMonth: true,
  monthlyAllowance: defaultMonthlyAllowance,
  navigateToAllowanceSettings: jest.fn(),
  remaining: 12000,
  totalExpense: 18000,
  ...overrides,
});

describe("BudgetSummaryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useNavigationContextから取得したnavigateをuseBudgetSummaryPageStateに渡す", () => {
    const state = createState();
    mockUsePageState.mockReturnValue(state as never);
    const mockNavigate = jest.fn();
    mockUseNavigationContext.mockReturnValue(mockNavigate);

    render(<BudgetSummaryPage />);

    expect(mockUsePageState).toHaveBeenCalledWith({ navigate: mockNavigate });
  });

  it("月次サマリーの3カードと月ナビゲーションを表示する", () => {
    const state = createState();
    mockUsePageState.mockReturnValue(state as never);

    render(<BudgetSummaryPage />);

    expect(screen.getByText("📊 月次サマリー")).toBeInTheDocument();
    expect(screen.getByText("2026年 3月")).toBeInTheDocument();
    expect(screen.getByText("￥190,000")).toBeInTheDocument();
    expect(screen.getByText("￥18,000")).toBeInTheDocument();
    expect(screen.getByText("￥12,000")).toBeInTheDocument();

    fireEvent.click(screen.getByText("← 前月"));
    fireEvent.click(screen.getByText("次月 →"));

    expect(state.goToPreviousMonth).toHaveBeenCalled();
    expect(state.goToNextMonth).toHaveBeenCalled();
  });

  it("収入・固定費・変動費を編集ボタンでnavigateToAllowanceSettingsが呼ばれる", () => {
    const state = createState();
    mockUsePageState.mockReturnValue(state as never);

    render(<BudgetSummaryPage />);

    fireEvent.click(screen.getByText("収入・固定費・変動費を編集"));

    expect(state.navigateToAllowanceSettings).toHaveBeenCalled();
  });
});
