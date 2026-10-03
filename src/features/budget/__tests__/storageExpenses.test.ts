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
    // toISOString だけでなく getHours/getMinutes（usedTime算出に使う）も
    // 決定的にするため、日付だけでなく実際の時刻をfakeTimersで固定する。
    // "2026-05-01T00:00:00.000Z" はTZ=Asia/Tokyo環境ではローカル9:00になる。
    jest.useFakeTimers().setSystemTime(new Date("2026-05-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("addExpenseはcategoryIdを保持しdescriptionを持たない支出を追加する", () => {
    mockGetBudgetData.mockReturnValue({ expenses: {} });

    addExpense("2026-05-10", 1500, "cat-1");

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      expenses: {
        "2026-05": [
          {
            id: "expense-1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
            usedTime: "09:00",
          },
        ],
      },
    });
  });

  it("categoryIdを省略した場合はundefinedとして保存される", () => {
    mockGetBudgetData.mockReturnValue({ expenses: {} });

    addExpense("2026-05-10", 1500);

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      expenses: {
        "2026-05": [expect.objectContaining({ categoryId: undefined })],
      },
    });
  });

  it("addExpenseはcreatedAtとusedTimeを同一のnowから算出する（記録時刻と追加時刻のデフォルトが一致する）", () => {
    mockGetBudgetData.mockReturnValue({ expenses: {} });

    addExpense("2026-05-10", 1500, "cat-1");

    const saved = mockSaveBudgetData.mock.calls[0][0].expenses["2026-05"][0];
    expect(saved.createdAt).toBe("2026-05-01T00:00:00.000Z");
    expect(saved.usedTime).toBe("09:00");
  });

  it("deleteExpenseは指定したidの支出だけを取り除く", () => {
    mockGetBudgetData.mockReturnValue({
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
    mockGetBudgetData.mockReturnValue({ expenses: {} });

    expect(getMonthlyExpenses("2026-05")).toEqual([]);
  });

  it("updateExpenseは同月内の更新でid/createdAtを保持しdate/amount/categoryIdを更新する", () => {
    mockGetBudgetData.mockReturnValue({
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

    updateExpense("2026-05", "e1", {
      date: "2026-05-20",
      amount: 2000,
      categoryId: "cat-2",
    });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
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

    updateExpense("2026-05", "e2", { date: "2026-05-11", amount: 700 });

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

    updateExpense("2026-05", "e1", {
      date: "2026-04-28",
      amount: 1500,
      categoryId: "cat-1",
    });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
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

    updateExpense("2026-05", "e1", { date: "2026-06-02", amount: 1500 });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
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

    updateExpense("2026-05", "e-missing", { date: "2026-05-20", amount: 2000 });

    expect(mockSaveBudgetData).not.toHaveBeenCalled();
  });

  it("updateExpenseは月バケット自体が存在しない場合は何も保存しない", () => {
    mockGetBudgetData.mockReturnValue({ expenses: {} });

    updateExpense("2026-05", "e1", { date: "2026-05-20", amount: 2000 });

    expect(mockSaveBudgetData).not.toHaveBeenCalled();
  });

  it("updateExpenseはupdatesでcategoryIdを省略した場合は既存のcategoryIdを保持する", () => {
    mockGetBudgetData.mockReturnValue({
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
      },
    });

    updateExpense("2026-05", "e1", { date: "2026-05-20", amount: 2000 });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-20",
            amount: 2000,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });

  it("updateExpenseはupdatesにusedTimeを含めて渡すと追加時刻を更新する", () => {
    mockGetBudgetData.mockReturnValue({
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
            usedTime: "09:00",
          },
        ],
      },
    });

    updateExpense("2026-05", "e1", {
      date: "2026-05-10",
      amount: 1500,
      categoryId: "cat-1",
      usedTime: "21:15",
    });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
            usedTime: "21:15",
          },
        ],
      },
    });
  });

  it("updateExpenseはupdatesでusedTimeを省略した場合は既存のusedTimeを保持する", () => {
    mockGetBudgetData.mockReturnValue({
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-10",
            amount: 1500,
            categoryId: "cat-1",
            createdAt: "2026-05-01T00:00:00.000Z",
            usedTime: "09:00",
          },
        ],
      },
    });

    updateExpense("2026-05", "e1", { date: "2026-05-20", amount: 2000 });

    const saved = mockSaveBudgetData.mock.calls[0][0].expenses["2026-05"][0];
    expect(saved.usedTime).toBe("09:00");
  });

  it("updateExpenseはupdatesでcategoryIdをundefinedとして明示した場合はカテゴリをクリアする", () => {
    mockGetBudgetData.mockReturnValue({
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
      },
    });

    updateExpense("2026-05", "e1", {
      date: "2026-05-20",
      amount: 2000,
      categoryId: undefined,
    });

    expect(mockSaveBudgetData).toHaveBeenCalledWith({
      expenses: {
        "2026-05": [
          {
            id: "e1",
            date: "2026-05-20",
            amount: 2000,
            categoryId: undefined,
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      },
    });
  });
});
