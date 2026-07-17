import { createBudgetExpenseItem } from "../budgetExpenseItemFactory";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  generateId: jest.fn(),
}));

const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("createBudgetExpenseItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("budget-expense-item-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-05-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("id・name・amount・kind・createdAtを持つ支出項目を作る（固定費）", () => {
    expect(createBudgetExpenseItem("家賃", 80000, "fixed")).toEqual({
      id: "budget-expense-item-1",
      name: "家賃",
      amount: 80000,
      kind: "fixed",
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    expect(mockGenerateId).toHaveBeenCalledWith("budget-expense-item");
  });

  it("kind=\"variable\"を指定すると変動費として作られる", () => {
    expect(createBudgetExpenseItem("食費", 30000, "variable")).toEqual({
      id: "budget-expense-item-1",
      name: "食費",
      amount: 30000,
      kind: "variable",
      createdAt: "2026-05-01T00:00:00.000Z",
    });
  });
});
