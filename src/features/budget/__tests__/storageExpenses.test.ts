import { addExpense, deleteExpense, getMonthlyExpenses } from "../storageExpenses";
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
});
