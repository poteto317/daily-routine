import {
  addExpense,
  deleteExpense,
  getMonthlyExpenses,
  updateExpense,
} from "../storageExpenses";
import { getBudgetData, saveBudgetData } from "../storageData";
import * as coreStorage from "@/lib/storage/core";

jest.mock("../storageData");
jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  generateId: jest.fn(),
}));

const mockGetBudgetData = getBudgetData as jest.MockedFunction<
  typeof getBudgetData
>;
const mockSaveBudgetData = saveBudgetData as jest.MockedFunction<
  typeof saveBudgetData
>;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("budget storageExpenses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("expense-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-05-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("addExpenseはcategoryIdを保持しdescriptionを持たない支出を追加する", () => {
    mockGetBudgetData.mockReturnValue({ budgets: {}, expenses: {} });

    addExpense("2026-05-10", 1500, "cat-1");

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "expense-1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("categoryIdを省略した場合はundefinedとして保存される", () => {
    mockGetBudgetData.mockReturnValue({ budgets: {}, expenses: {} });

    addExpense("2026-05-10", 1500);

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [
          expect.objectContaining({ categoryId: undefined }),
        ],
      },
    });
  });

  it("deleteExpenseは指定したidの支出だけを取り除く", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-11",
            amount: 500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });

    deleteExpense("2026-05", "e1");

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e2",
            date: "2026-05-11",
            amount: 500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("getMonthlyExpensesは未登録月は空配列を返す", () => {
    mockGetBudgetData.mockReturnValue({ budgets: {}, expenses: {} });

    expect(getMonthlyExpenses("2026-05")).toEqual([]);
  });

  it("updateExpenseは同月内の更新でid/createdAtを保持しdate/amount/categoryIdを更新する", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-11",
            amount: 500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });

    updateExpense("2026-05", "e1", "2026-05-20", 2000, "cat-2");

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-20",
            amount: 2000,
            categoryId: "cat-2",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-11",
            amount: 500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("updateExpenseは同月内の更新で配列の並び順を保つ", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "e2",
            date: "2026-05-11",
            amount: 500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "e3",
            date: "2026-05-12",
            amount: 800,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });

    updateExpense("2026-05", "e2", "2026-05-11", 700);

    const savedExpenses = mockSaveBudgetData.mock.calls[0][0].expenses[
      "2026-05"
    ] as { id: string }[];
    expect(savedExpenses.map((expense) => expense.id)).toEqual([
      "e1",
      "e2",
      "e3",
    ]);
  });

  it("updateExpenseは月をまたぐ日付変更で旧月バケットから除去し新月バケットへ移動する", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
        "2026-04": [
          {
            id: "e0",
            date: "2026-04-01",
            amount: 300,
            createdAt: "2026-04-01T00:00:00.000Z",
          },
        ],
      },
    });

    updateExpense("2026-05", "e1", "2026-04-28", 1500, "cat-1");

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [],
        "2026-04": [
          {
            id: "e0",
            date: "2026-04-01",
            amount: 300,
            createdAt: "2026-04-01T00:00:00.000Z",
          },
          {
            id: "e1",
            date: "2026-04-28",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("updateExpenseは移動先の月バケットが未作成の場合に新規作成する", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });

    updateExpense("2026-05", "e1", "2026-06-02", 1500);

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      budgets: {},
      expenses: {
        "2026-05": [],
        "2026-06": [
          {
            id: "e1",
            date: "2026-06-02",
            amount: 1500,
            categoryId: undefined,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("updateExpenseは存在しないidを指定した場合は何も保存しない", () => {
    mockGetBudgetData.mockReturnValue({
      budgets: {},
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });

    updateExpense("2026-05", "e-missing", "2026-05-20", 2000);

    expect(mockSaveBudgetData).not.toHaveBeenCalled();
  });

  it("updateExpenseは月バケット自体が存在しない場合は何も保存しない", () => {
    mockGetBudgetData.mockReturnValue({ budgets: {}, expenses: {} });

    updateExpense("2026-05", "e1", "2026-05-20", 2000);

    expect(mockSaveBudgetData).not.toHaveBeenCalled();
  });
});
