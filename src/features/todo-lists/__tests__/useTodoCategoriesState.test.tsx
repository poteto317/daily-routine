import { renderHook } from "@testing-library/react";
import { useTodoCategoriesState } from "../useTodoCategoriesState";
import { getTodoCategories } from "../storage";

jest.mock("../storage", () => ({
  getTodoCategories: jest.fn(),
}));

const mockGetTodoCategories = getTodoCategories as jest.MockedFunction<
  typeof getTodoCategories
>;

describe("useTodoCategoriesState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTodoCategoriesで読み込んだカテゴリ一覧を返す", () => {
    const categories = [
      { id: "cat-1", name: "仕事", createdAt: "2026-05-01T00:00:00.000Z" },
    ];
    mockGetTodoCategories.mockReturnValue(categories);

    const { result } = renderHook(() => useTodoCategoriesState());

    expect(result.current.categories).toEqual(categories);
    expect(mockGetTodoCategories).toHaveBeenCalledTimes(1);
  });
});
