import { createTodoCategory } from "../todoCategoryFactory";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  generateId: jest.fn(),
}));

const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("createTodoCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("todo-category-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-05-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("id・name・createdAtを持つカテゴリを作る", () => {
    expect(createTodoCategory("仕事")).toEqual({
      id: "todo-category-1",
      name: "仕事",
      color: undefined,
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    expect(mockGenerateId).toHaveBeenCalledWith("todo-category");
  });

  it("colorを指定するとカテゴリに含まれる", () => {
    expect(createTodoCategory("仕事", "bg-blue-50")).toEqual({
      id: "todo-category-1",
      name: "仕事",
      color: "bg-blue-50",
      createdAt: "2026-05-01T00:00:00.000Z",
    });
  });
});
