import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetPage } from "../BudgetPage";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
jest.mock("@/lib/downloadJsonFile", () => ({ downloadJsonFile: jest.fn() }));
const mockDownloadJsonFile = jest.mocked(downloadJsonFile);

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

const createState = (overrides: Record<string, unknown> = {}) => ({
  categories,
  closeExpenseForm: jest.fn(),
  currentDate: new Date("2026-03-07T00:00:00+09:00"),
  dailyRemainingBudget: 1200,
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
  missingExpenseDates: [],
  navigateToCategoryManagement: jest.fn(),
  navigateToSummary: jest.fn(),
  openExpenseForm: jest.fn(),
  startAddExpenseOnDate: jest.fn(),
  formOpenRequest: 0,
  showExpenseForm: false,
  todayExpense: 3000,
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

  it("月次サマリーボタンをクリックするとstateのnavigateToSummaryが呼ばれる", () => {
    const state = createState();
    mockUseBudgetPageState.mockReturnValue(state as never);

    render(<BudgetPage />);

    fireEvent.click(screen.getByText("📊 月次サマリー"));

    expect(state.navigateToSummary).toHaveBeenCalled();
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
    expect(screen.queryByText("BETA")).not.toBeInTheDocument();
    expect(screen.getByText("2026年 3月")).toBeInTheDocument();
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
      createState({ expenses: [] }) as never,
    );

    render(<BudgetPage />);

    expect(screen.getByText("まだ支出の記録がありません")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "3月6日の支出を編集" }));

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

  describe("未入力の日", () => {
    it("state の未入力の日を「➕」より前の欄に出し、日付を押すと startAddExpenseOnDate をその日付で呼ぶ", () => {
      const state = createState({
        missingExpenseDates: ["2026-03-02", "2026-03-04"],
      });
      mockUseBudgetPageState.mockReturnValue(state as never);

      render(<BudgetPage />);

      const region = screen.getByRole("region", {
        name: "📝 未入力の日（2日）",
      });
      expect(
        region.compareDocumentPosition(screen.getByText("➕")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      fireEvent.click(
        screen.getByRole("button", { name: "3月4日(水)の支出を記録" }),
      );

      expect(state.startAddExpenseOnDate).toHaveBeenCalledTimes(1);
      expect(state.startAddExpenseOnDate).toHaveBeenCalledWith("2026-03-04");
    });

    it("未入力の日が無ければ欄を出さない", () => {
      mockUseBudgetPageState.mockReturnValue(
        createState({ missingExpenseDates: [] }) as never,
      );

      render(<BudgetPage />);

      expect(
        screen.queryByRole("region", { name: /未入力の日/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("支出フォームを開いたときのスクロール", () => {
    // jsdom は scrollIntoView を実装していないため、このブロックの中だけ差し替える
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    let scrollIntoView: jest.Mock;

    beforeEach(() => {
      scrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    });

    it("フォームを表示すると 1 回 block: nearest でスクロールし、再描画では増えない", () => {
      const state = createState({ showExpenseForm: true });
      mockUseBudgetPageState.mockReturnValue(state as never);

      const { rerender } = render(<BudgetPage />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: true, expenseAmount: "2000" }) as never,
      );
      rerender(<BudgetPage />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it("state の formOpenRequest が変わると、BudgetExpenseForm へ渡してもう一度スクロールする", () => {
      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: true, formOpenRequest: 3 }) as never,
      );
      const { rerender } = render(<BudgetPage />);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      // 日付だけが変わる（月の移動など）再描画ではスクロールしない
      mockUseBudgetPageState.mockReturnValue(
        createState({
          showExpenseForm: true,
          formOpenRequest: 3,
          expenseDate: "2026-04-01",
        }) as never,
      );
      rerender(<BudgetPage />);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: true, formOpenRequest: 4 }) as never,
      );
      rerender(<BudgetPage />);
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });

    it("フォームを閉じているときはスクロールしない", () => {
      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: false }) as never,
      );

      render(<BudgetPage />);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});

describe("BudgetPage 月別エクスポートの配線", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownloadJsonFile.mockReset();
  });

  it("表示月の保存済み支出と参照カテゴリを実部品から書き出し、未保存の値は含めない", () => {
    const state = createState({
      editingExpenseId: "e1",
      editingExpenseAmount: "9999",
      editingExpenseDate: "2026-03-06",
    });
    mockUseBudgetPageState.mockReturnValue(state as never);
    render(<BudgetPage />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "この月の支出を JSON でエクスポート",
      }),
    );
    expect(mockDownloadJsonFile).toHaveBeenCalledWith(
      "daily-routine-budget-2026-03.json",
      {
        budgetData: { expenses: { "2026-03": state.expenses } },
        budgetCategories: [categories[0]],
      },
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "JSON のダウンロードを開始しました",
    );
  });

  it("月変更で前の結果を消し、変更後の月と支出を出力する", () => {
    mockUseBudgetPageState.mockReturnValue(createState() as never);
    const { rerender } = render(<BudgetPage />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "この月の支出を JSON でエクスポート",
      }),
    );
    const nextExpense = { ...createState().expenses[0], date: "2027-01-01" };
    mockUseBudgetPageState.mockReturnValue(
      createState({
        currentDate: new Date(2027, 0, 1),
        expenses: [nextExpense],
      }) as never,
    );
    rerender(<BudgetPage />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "この月の支出を JSON でエクスポート",
      }),
    );
    expect(mockDownloadJsonFile).toHaveBeenLastCalledWith(
      "daily-routine-budget-2027-01.json",
      {
        budgetData: { expenses: { "2027-01": [nextExpense] } },
        budgetCategories: [categories[0]],
      },
    );
  });
});
