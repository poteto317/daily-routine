import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetPage } from "../BudgetPage";

jest.mock("../useBudgetPageState", () => ({
  useBudgetPageState: jest.fn(),
}));

jest.mock("@/features/routine/pages/NavigationContext", () => ({
  useNavigationContext: jest.fn(() => jest.fn()),
}));

import { useBudgetPageState } from "../useBudgetPageState";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";

const mockUseBudgetPageState = useBudgetPageState as jest.MockedFunction<
  typeof useBudgetPageState
>;
const mockUseNavigationContext = useNavigationContext as jest.MockedFunction<
  typeof useNavigationContext
>;

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-01-01T00:00:00.000Z" },
  {
    id: "cat-transport",
    name: "交通費",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const defaultMonthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  categories,
  closeExpenseForm: jest.fn(),
  currentDate: new Date("2026-03-07T00:00:00+09:00"),
  dailyBudget: 1000,
  dailyRemainingBudget: 1200,
  daysRemaining: 26,
  expenseAmount: "1500",
  expenseDate: "2026-03-07",
  expenseCategoryId: "",
  expenses: [
    {
      id: "e1",
      date: "2026-03-06",
      amount: 1500,
      categoryId: "cat-lunch",
      createdAt: "2026-03-06T00:00:00.000Z",
    },
  ],
  editingExpenseId: null,
  editingExpenseDate: "",
  editingExpenseAmount: "",
  editingExpenseCategoryId: "",
  goToCurrentMonth: jest.fn(),
  goToNextMonth: jest.fn(),
  goToPreviousMonth: jest.fn(),
  handleAddExpense: jest.fn(),
  handleUpdateExpense: jest.fn(),
  handleDeleteExpense: jest.fn(),
  handleExpenseAmountChange: jest.fn(),
  handleExpenseDateChange: jest.fn(),
  handleExpenseCategoryIdChange: jest.fn(),
  handleEditExpenseAmountChange: jest.fn(),
  handleEditExpenseDateChange: jest.fn(),
  handleEditExpenseCategoryIdChange: jest.fn(),
  startEditExpense: jest.fn(),
  cancelEditExpense: jest.fn(),
  isCurrentMonth: true,
  monthBudget: 30000,
  monthlyAllowance: defaultMonthlyAllowance,
  navigateToCategoryManagement: jest.fn(),
  navigateToAllowanceSettings: jest.fn(),
  openExpenseForm: jest.fn(),
  remaining: 12000,
  showExpenseForm: false,
  todayExpense: 3000,
  totalExpense: 18000,
  ...overrides,
});

describe("BudgetPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ管理ボタンをクリックするとstateのnavigateToCategoryManagementが呼ばれる", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.click(screen.getByText("🏷️ カテゴリ管理"));

    expect(state.navigateToCategoryManagement).toHaveBeenCalled();
  });

  it("収入・固定費・変動費を編集ボタンをクリックするとstateのnavigateToAllowanceSettingsが呼ばれる", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.click(screen.getByText("収入・固定費・変動費を編集"));

    expect(state.navigateToAllowanceSettings).toHaveBeenCalled();
  });

  it("useNavigationContextから取得したnavigateをuseBudgetPageStateに渡す", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);
    const mockNavigate = jest.fn();
    mockUseNavigationContext.mockReturnValue(mockNavigate);

    render(<BudgetPage />);

    expect(mockUseBudgetPageState).toHaveBeenCalledWith({
      navigate: mockNavigate,
    });
  });

  it("通常表示でサマリーと支出一覧を表示する", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    expect(screen.getByText("💰 家計簿")).toBeInTheDocument();
    expect(screen.getByText("2026年 3月")).toBeInTheDocument();
    expect(screen.getByText("￥30,000")).toBeInTheDocument();
    expect(screen.getByText("￥18,000")).toBeInTheDocument();
    expect(screen.getByText("￥12,000")).toBeInTheDocument();
    expect(screen.getByText("￥1,500")).toBeInTheDocument();
    expect(screen.getByText("🏷️ ランチ")).toBeInTheDocument();

    fireEvent.click(screen.getByText("← 前月"));
    fireEvent.click(screen.getByText("次月 →"));
    fireEvent.click(screen.getByText("➕"));

    expect(state.goToPreviousMonth).toHaveBeenCalled();
    expect(state.goToNextMonth).toHaveBeenCalled();
    expect(state.openExpenseForm).toHaveBeenCalled();
  });

  it("フォーム表示時に入力イベントを委譲する", () => {
    const state = createState({
      isCurrentMonth: false,
      showExpenseForm: true,
    });
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.click(screen.getByText("今月に戻る"));

    fireEvent.change(screen.getByLabelText("日付（日）"), {
      target: { value: "2026-03-08" },
    });
    fireEvent.change(screen.getByPlaceholderText("例: 1500"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText(/カテゴリ/), {
      target: { value: "cat-transport" },
    });
    fireEvent.click(screen.getByText("追加"));
    fireEvent.click(screen.getByText("キャンセル"));

    expect(state.goToCurrentMonth).toHaveBeenCalled();
    expect(state.handleExpenseDateChange).toHaveBeenCalledWith("2026-03-08");
    expect(state.handleExpenseAmountChange).toHaveBeenCalledWith("2000");
    expect(state.handleExpenseCategoryIdChange).toHaveBeenCalledWith(
      "cat-transport",
    );
    expect(state.handleAddExpense).toHaveBeenCalled();
    expect(state.closeExpenseForm).toHaveBeenCalled();
  });

  it("削除確認の結果に応じて削除する", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);
    jest
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    render(<BudgetPage />);

    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));

    expect(window.confirm).toHaveBeenCalledTimes(2);
    expect(state.handleDeleteExpense).toHaveBeenCalledTimes(1);
    expect(state.handleDeleteExpense).toHaveBeenCalledWith("e1");

    (window.confirm as jest.Mock).mockRestore();
  });

  it("支出が空なら空状態を表示する", () => {
    mockUseBudgetPageState.mockReturnValue(
      createState({ expenses: [], monthBudget: 0, remaining: -500 }) as never,
    );

    render(<BudgetPage />);

    expect(screen.getByText("まだ支出の記録がありません")).toBeInTheDocument();
    expect(screen.getByText("予算オーバー")).toBeInTheDocument();
  });

  it("isCurrentMonth=true のとき今日の支出カードを表示する", () => {
    mockUseBudgetPageState.mockReturnValue(
      createState({ isCurrentMonth: true, todayExpense: 3000 }) as never,
    );

    render(<BudgetPage />);

    expect(screen.getByText("今日の支出")).toBeInTheDocument();
    expect(screen.getByText("￥3,000")).toBeInTheDocument();
  });

  it("isCurrentMonth=false のとき今日の支出カードを表示しない", () => {
    mockUseBudgetPageState.mockReturnValue(
      createState({ isCurrentMonth: false, todayExpense: 3000 }) as never,
    );

    render(<BudgetPage />);

    expect(screen.queryByText("今日の支出")).not.toBeInTheDocument();
  });

  it("支出の編集ボタンでstartEditExpenseが呼ばれる", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "3月6日の支出を編集" }),
    );

    expect(state.startEditExpense).toHaveBeenCalledWith(state.expenses[0]);
  });

  it("編集中の行でフィールド変更と保存/キャンセルが対応するハンドラを呼ぶ", () => {
    const state = createState({
      editingExpenseId: "e1",
      editingExpenseDate: "2026-03-06",
      editingExpenseAmount: "1500",
      editingExpenseCategoryId: "cat-lunch",
    });
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.change(screen.getByLabelText("日付（日）"), {
      target: { value: "2026-03-08" },
    });
    fireEvent.change(screen.getByLabelText(/金額/), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText(/カテゴリ/), {
      target: { value: "cat-transport" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(state.handleEditExpenseDateChange).toHaveBeenCalledWith(
      "2026-03-08",
    );
    expect(state.handleEditExpenseAmountChange).toHaveBeenCalledWith("2000");
    expect(state.handleEditExpenseCategoryIdChange).toHaveBeenCalledWith(
      "cat-transport",
    );
    expect(state.handleUpdateExpense).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(state.cancelEditExpense).toHaveBeenCalledTimes(1);
  });
});
