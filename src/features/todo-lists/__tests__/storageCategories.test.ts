import { getTodoCategories, saveTodoCategories } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("todo category storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTodoCategoriesは保存済みカテゴリ一覧を取得する", () => {
    const categories = [
      {
        id: "cat-1",
        name: "仕事",
        color: "bg-blue-50" as const,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ];
    mockGetStorageItem.mockReturnValue(categories);

    const result = getTodoCategories();

    expect(result).toEqual(categories);
    expect(mockGetStorageItem).toHaveBeenCalledWith("todo-categories", []);
  });

  it("saveTodoCategoriesはカテゴリ一覧を保存する", () => {
    const categories = [
      { id: "cat-1", name: "仕事", createdAt: "2026-05-01T00:00:00.000Z" },
    ];

    saveTodoCategories(categories);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "todo-categories",
      categories,
    );
  });
});
