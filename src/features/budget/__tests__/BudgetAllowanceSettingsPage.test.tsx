import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { downloadJsonFile } from "@/lib/downloadJsonFile";
import { buildBudgetAllowanceExport } from "../budgetAllowanceTransfer";
import { BudgetAllowanceSettingsPage } from "../components/BudgetAllowanceSettingsPage";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";
import { saveBudgetAllowanceItems } from "../storage";
import texts from "../locales/ja.json";

jest.mock("@/lib/downloadJsonFile", () => ({
  downloadJsonFile: jest.fn(),
}));
jest.mock("../storage", () => ({
  ...jest.requireActual("../storage"),
  saveBudgetAllowanceItems: jest.fn(),
}));
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
const mockDownloadJsonFile = downloadJsonFile as jest.MockedFunction<
  typeof downloadJsonFile
>;
const mockSaveBudgetAllowanceItems =
  saveBudgetAllowanceItems as jest.MockedFunction<
    typeof saveBudgetAllowanceItems
  >;

const transferTexts = texts.allowanceSettings.transfer;

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
  reloadItems: jest.fn(),
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
  reloadItems: jest.fn(),
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
      createExpenseState({
        items: [],
        fixedItems: [],
        variableItems: [],
      }) as never,
    );

    render(<BudgetAllowanceSettingsPage />);

    expect(screen.getAllByText("項目はまだありません")).toHaveLength(3);
  });

  it("収入項目が0件でも作成フォーム表示中は空状態を表示しない（「＋ 新しい項目を追加」の文言と矛盾するため）", () => {
    mockUseIncomeState.mockReturnValue(
      createIncomeState({ items: [], showForm: true }) as never,
    );
    mockUseExpenseState.mockReturnValue(
      createExpenseState({
        items: [],
        fixedItems: [],
        variableItems: [],
      }) as never,
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

  it('支出セクションの追加ボタンでexpense.openForm("fixed")が呼ばれる', () => {
    const expenseState = createExpenseState();
    mockUseExpenseState.mockReturnValue(expenseState as never);

    render(<BudgetAllowanceSettingsPage />);

    fireEvent.click(screen.getAllByText("＋ 新しい項目を追加")[1]);

    expect(expenseState.openForm).toHaveBeenCalledWith("fixed");
  });

  it("収入フォーム表示時に作成/キャンセルを委譲する", () => {
    const incomeState = createIncomeState({
      showForm: true,
      nameInput: "副業",
    });
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

  it("固定費の一覧は space-y-2 mb-4、変動費の一覧は space-y-2 で、それぞれの項目だけを含む", () => {
    render(<BudgetAllowanceSettingsPage />);

    const fixedList = screen.getByText("家賃").closest(".space-y-2");
    const variableList = screen.getByText("食費").closest(".space-y-2");

    expect(fixedList).toHaveAttribute("class", "space-y-2 mb-4");
    expect(variableList).toHaveAttribute("class", "space-y-2");
    expect(fixedList).not.toBe(variableList);
    expect(fixedList).not.toHaveTextContent("食費");
    expect(variableList).not.toHaveTextContent("家賃");
  });

  it("固定費・変動費が空のときは一覧を出さず空状態（mb-4なし）を表示し、フォームを開くと消える", () => {
    const empty = { items: [], fixedItems: [], variableItems: [] };
    mockUseIncomeState.mockReturnValue(
      createIncomeState({ showForm: true }) as never,
    );
    mockUseExpenseState.mockReturnValue(createExpenseState(empty) as never);

    const { container, rerender } = render(<BudgetAllowanceSettingsPage />);

    const emptyViews = screen.getAllByText("項目はまだありません");
    expect(emptyViews).toHaveLength(2);
    emptyViews.forEach((view) => {
      expect(view.parentElement).not.toHaveClass("mb-4");
    });
    const expenseSection = container.querySelectorAll("section")[1];
    expect(expenseSection.querySelector(".space-y-2")).toBeNull();

    mockUseExpenseState.mockReturnValue(
      createExpenseState({ ...empty, showForm: true }) as never,
    );
    rerender(<BudgetAllowanceSettingsPage />);

    expect(screen.queryByText("項目はまだありません")).not.toBeInTheDocument();
    expect(
      container.querySelectorAll("section")[1].querySelectorAll(".space-y-2"),
    ).toHaveLength(2);
  });

  it("固定費・変動費の見出しを順に表示する", () => {
    render(<BudgetAllowanceSettingsPage />);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual(["固定費", "変動費"]);
  });

  it("編集中の項目は固定費・変動費のどちらでも編集欄になり、コールバックが届く", () => {
    const expenseState = createExpenseState({
      editingItemId: "expense-1",
      editingItemName: "家賃改",
      editingItemAmount: "81000",
    });
    mockUseExpenseState.mockReturnValue(expenseState as never);

    const { rerender } = render(<BudgetAllowanceSettingsPage />);

    const nameInput = screen.getByLabelText("項目名");
    expect(nameInput).toHaveValue("家賃改");
    expect(screen.getByLabelText("金額")).toHaveValue(81000);
    fireEvent.change(nameInput, { target: { value: "X" } });
    expect(expenseState.setEditingItemName).toHaveBeenCalledWith("X");
    fireEvent.change(screen.getByLabelText("金額"), {
      target: { value: "5" },
    });
    expect(expenseState.setEditingItemAmount).toHaveBeenCalledWith("5");
    fireEvent.click(screen.getByText("保存"));
    expect(expenseState.commitEditItem).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByText("キャンセル")[0]);
    expect(expenseState.cancelEditItem).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText("食費を編集"));
    expect(expenseState.startEditItem).toHaveBeenCalledWith(variableItem);
    fireEvent.click(screen.getByLabelText("食費を削除"));
    expect(expenseState.handleDelete).toHaveBeenCalledWith(variableItem);
    fireEvent.click(screen.getByLabelText("食費の分類を切り替える"));
    expect(expenseState.toggleItemKind).toHaveBeenCalledWith("expense-2");

    const variableEditing = createExpenseState({
      editingItemId: "expense-2",
      editingItemName: "食費改",
      editingItemAmount: "31000",
    });
    mockUseExpenseState.mockReturnValue(variableEditing as never);
    rerender(<BudgetAllowanceSettingsPage />);

    expect(screen.getByLabelText("項目名")).toHaveValue("食費改");
    fireEvent.click(screen.getByText("保存"));
    expect(variableEditing.commitEditItem).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText("家賃を編集"));
    expect(variableEditing.startEditItem).toHaveBeenCalledWith(fixedItem);
    fireEvent.click(screen.getByLabelText("家賃を削除"));
    expect(variableEditing.handleDelete).toHaveBeenCalledWith(fixedItem);
  });

  describe("エクスポート・インポート", () => {
    const fileText = JSON.stringify(
      buildBudgetAllowanceExport([incomeItem], [fixedItem, variableItem]),
    );

    /** jest の jsdom には File#text が無いのでスタブで渡す */
    const selectFile = async (text: string) => {
      fireEvent.change(screen.getByLabelText(transferTexts.fileInputLabel), {
        target: {
          files: [{ size: text.length, text: () => Promise.resolve(text) }],
        },
      });
    };

    beforeEach(() => {
      mockSaveBudgetAllowanceItems.mockReturnValue("saved");
      jest.spyOn(window, "confirm").mockReturnValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("ファイルを取り込むと、収入と支出の一覧をそれぞれ 1 回読み直し、成功を表示する", async () => {
      // 片方でも読み直さないと、古い一覧を基にした次の保存で取り込んだ内容が消える
      const incomeState = createIncomeState();
      const expenseState = createExpenseState();
      mockUseIncomeState.mockReturnValue(incomeState as never);
      mockUseExpenseState.mockReturnValue(expenseState as never);

      render(<BudgetAllowanceSettingsPage />);
      await selectFile(fileText);

      expect(await screen.findByRole("status")).toHaveTextContent(
        "収入 1 件・固定費 1 件・変動費 1 件を読み込みました",
      );
      expect(mockSaveBudgetAllowanceItems).toHaveBeenCalledTimes(1);
      expect(incomeState.reloadItems).toHaveBeenCalledTimes(1);
      expect(expenseState.reloadItems).toHaveBeenCalledTimes(1);
    });

    it("保存に失敗したら一覧を読み直さず、エラーを表示する", async () => {
      mockSaveBudgetAllowanceItems.mockReturnValue("failed");
      const incomeState = createIncomeState();
      const expenseState = createExpenseState();
      mockUseIncomeState.mockReturnValue(incomeState as never);
      mockUseExpenseState.mockReturnValue(expenseState as never);

      render(<BudgetAllowanceSettingsPage />);
      await selectFile(fileText);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        transferTexts.errors.saveFailed,
      );
      expect(incomeState.reloadItems).not.toHaveBeenCalled();
      expect(expenseState.reloadItems).not.toHaveBeenCalled();
    });

    it("エクスポートのボタンで downloadJsonFile が呼ばれる", () => {
      render(<BudgetAllowanceSettingsPage />);

      fireEvent.click(screen.getByText(transferTexts.exportButton));

      expect(mockDownloadJsonFile).toHaveBeenCalledTimes(1);
    });

    it("インポートのボタンで隠したファイル入力を開く", () => {
      const click = jest.spyOn(HTMLInputElement.prototype, "click");
      render(<BudgetAllowanceSettingsPage />);

      fireEvent.click(screen.getByText(transferTexts.importButton));

      expect(click).toHaveBeenCalledTimes(1);
    });
  });
});
