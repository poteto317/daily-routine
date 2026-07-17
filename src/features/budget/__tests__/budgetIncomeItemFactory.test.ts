import { createBudgetIncomeItem } from "../budgetIncomeItemFactory";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  generateId: jest.fn(),
}));

const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("createBudgetIncomeItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("budget-income-item-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-05-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("id・name・amount・createdAtを持つ収入項目を作る", () => {
    expect(createBudgetIncomeItem("給与", 300000)).toEqual({
      id: "budget-income-item-1",
      name: "給与",
      amount: 300000,
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    expect(mockGenerateId).toHaveBeenCalledWith("budget-income-item");
  });
});
