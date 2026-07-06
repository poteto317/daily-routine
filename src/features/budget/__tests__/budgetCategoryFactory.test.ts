import { createBudgetCategory } from "../budgetCategoryFactory";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  generateId: jest.fn(),
}));

const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("createBudgetCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("budget-category-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-05-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("id・name・createdAtを持つカテゴリを作る", () => {
    expect(createBudgetCategory("食料品")).toEqual({
      id: "budget-category-1",
      name: "食料品",
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    expect(mockGenerateId).toHaveBeenCalledWith("budget-category");
  });
});
