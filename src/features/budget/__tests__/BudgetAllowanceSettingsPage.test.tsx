import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetAllowanceSettingsPage } from "../components/BudgetAllowanceSettingsPage";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";

jest.mock("../useBudgetIncomeItemManagementPageState", () => ({
  useBudgetIncomeItemManagementPageState: jest.fn(),
}));
jest.mock("../useBudgetExpenseItemManagementPageState", () => ({
  useBudgetExpenseItemManagementPageState: jest.fn(),
}));

const mockUseIncomeState =
  useBudgetIncomeItemManagementPageState as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementPageState
  >;
const mockUseExpenseState =
  useBudgetExpenseItemManagementPageState as jest.MockedFunction<
    typeof useBudgetExpenseItemManagementPageState
  >;

const incomeItem = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const fixedItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const variableItem = {
  id: "expense-2",
  name: "食費",
  amount: 30000,
  kind: "variable" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

const createIncomeState = (overrides: Record<string, unknown> = {}) => ({
  items: [incomeItem],
  inputRef: createRef<HTMLInputElement>(),
  nameInput: "",
  amountInput: "",
  showForm: false,
  setNameInput: jest.fn(),
  setAmountInput: jest.fn(),
  openForm: jest.fn(),
  closeForm: jest.fn(),
  handleCreate: jest.fn(),
  handleDelete: jest.fn(),
  editingItemId: null,
  editingItemName: "",
  editingItemAmount: "",
  setEditingItemName: jest.fn(),
  setEditingItemAmount: jest.fn(),
  startEditItem: jest.fn(),
  commitEditItem: jest.fn(),
  cancelEditItem: jest.fn(),
  ...overrides,
});

const createExpenseState = (overrides: Record<string, unknown> = {}) => ({
  items: [fixedItem, variableItem],
  fixedItems: [fixedItem],
  variableItems: [variableItem],
  inputRef: createRef<HTMLInputElement>(),
  nameInput: "",
  amountInput: "",
  kindInput: "fixed" as const,
  showForm: false,
  setNameInput: jest.fn(),
  setAmountInput: jest.fn(),
  setKindInput: jest.fn(),
  openForm: jest.fn(),
  closeForm: jest.fn(),
  handleCreate: jest.fn(),
  handleDelete: jest.fn(),
  editingItemId: null,
  editingItemName: "",
  editingItemAmount: "",
  setEditingItemName: jest.fn(),
  setEditingItemAmount: jest.fn(),
  startEditItem: jest.fn(),
  commitEditItem: jest.fn(),
  cancelEditItem: jest.fn(),
  toggleItemKind: jest.fn(),
  ...overrides,
});

describe("BudgetAllowanceSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIncomeState.mockReturnValue(createIncomeState() as never);
    mockUseExpenseState.mockReturnValue(createExpenseState() as never);
  });

  it("タイトル・収入項目・固定費・変動費を表示する", () => {
    render(<BudgetAllowanceSettingsPage />);

    expect(
      screen.getByText("💰 収入・固定費・変動費の設定"),
    ).toBeInTheDocument();
    expect(screen.getByText("給与")).toBeInTheDocument();
    expect(screen.getByText("家賃")).toBeInTheDocument();
    expect(screen.getByText("食費")).toBeInTheDocument();
  });

  it("収入・支出それぞれ空の場合は空状態を表示する", () => {
    mockUseIncomeState.mockReturnValue(
      createIncomeState({ items: [] }) as never,
    );
    mockUseExpenseState.mockReturnValue(
      createExpenseState({ items: [], fixedItems: [], variableItems: [] }) as never,
    );

    render(<BudgetAllowanceSettingsPage />);

    expect(screen.getAllByText("項目はまだありません")).toHaveLength(3);
  });

  it("収入項目が0件でも作成フォーム表示中は空状態を表示しない（「＋ 新しい項目を追加」の文言と矛盾するため）", () => {
    mockUseIncomeState.mockReturnValue(
      createIncomeState({ items: [], showForm: true }) as never,
    );
    mockUseExpenseState.mockReturnValue(
      createExpenseState({ items: [], fixedItems: [], variableItems: [] }) as never,
    );

    render(<BudgetAllowanceSettingsPage />);

    // 収入セクションの空状態は非表示（支出の固定費・変動費の2件分のみ表示される）
    expect(screen.getAllByText("項目はまだありません")).toHaveLength(2);
  });

  it("支出項目が0件でも作成フォーム表示中は空状態を表示しない（「＋ 新しい項目を追加」の文言と矛盾するため）", () => {
    mockUseIncomeState.mockReturnValue(
      createIncomeState({ items: [] }) as never,
    );
    mockUseExpenseState.mockReturnValue(
      createExpenseState({
        items: [],
        fixedItems: [],
        variableItems: [],
        showForm: true,
      }) as never,
    );

    render(<BudgetAllowanceSettingsPage />);

    // 支出セクション（固定費・変動費）の空状態は非表示（収入の1件分のみ表示される）
    expect(screen.getAllByText("項目はまだありません")).toHaveLength(1);
  });

  it("収入セクションの追加ボタンでincome.openFormが呼ばれる", () => {
    const incomeState = createIncomeState();
    mockUseIncomeState.mockReturnValue(incomeState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getAllByText("＋ 新しい項目を追加")[0]);

    expect(incomeState.openForm).toHaveBeenCalled();
  });

  it("支出セクションの追加ボタンでexpense.openForm(\"fixed\")が呼ばれる", () => {
    const expenseState = createExpenseState();
    mockUseExpenseState.mockReturnValue(expenseState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getAllByText("＋ 新しい項目を追加")[1]);

    expect(expenseState.openForm).toHaveBeenCalledWith("fixed");
  });

  it("収入フォーム表示時に作成/キャンセルを委譲する", () => {
    const incomeState = createIncomeState({ showForm: true, nameInput: "副業" });
    mockUseIncomeState.mockReturnValue(incomeState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getByText("作成"));
    expect(incomeState.handleCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByText("キャンセル"));
    expect(incomeState.closeForm).toHaveBeenCalled();
  });

  it("固定費の分類バッジをクリックするとexpense.toggleItemKindが呼ばれる", () => {
    const expenseState = createExpenseState();
    mockUseExpenseState.mockReturnValue(expenseState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getByLabelText("家賃の分類を切り替える"));

    expect(expenseState.toggleItemKind).toHaveBeenCalledWith("expense-1");
  });

  it("収入項目の削除ボタンでincome.handleDeleteが呼ばれる", () => {
    const incomeState = createIncomeState();
    mockUseIncomeState.mockReturnValue(incomeState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getByLabelText("給与を削除"));

    expect(incomeState.handleDelete).toHaveBeenCalledWith(incomeItem);
  });
});
