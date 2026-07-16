import {
  addTodoCategory,
  removeTodoCategory,
  renameTodoCategory,
  updateTodoCategoryColor,
} from "../todoCategoryMutations";
import { createTodoCategory } from "../todoCategoryFactory";
import type { TodoCategory } from "../types";

jest.mock("../todoCategoryFactory", () => ({
  createTodoCategory: jest.fn(),
}));

const mockCreateTodoCategory = createTodoCategory as jest.MockedFunction<
  typeof createTodoCategory
>;

const category = (overrides: Partial<TodoCategory> = {}): TodoCategory => ({
  id: "cat-1",
  name: "仕事",
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("todoCategoryMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addTodoCategory", () => {
    it("正規化した名前でカテゴリを追加する", () => {
      const categories = [category()];
      const created = category({ id: "cat-2", name: "プライベート" });
      mockCreateTodoCategory.mockReturnValue(created);

      const result = addTodoCategory(categories, "  プライベート  ");

      expect(mockCreateTodoCategory).toHaveBeenCalledWith(
        "プライベート",
        undefined,
      );
      expect(result).toEqual([...categories, created]);
    });

    it("colorを指定するとcreateTodoCategoryに渡される", () => {
      const categories: ReturnType<typeof category>[] = [];
      const created = category({ id: "cat-2", color: "bg-blue-50" });
      mockCreateTodoCategory.mockReturnValue(created);

      addTodoCategory(categories, "仕事", "bg-blue-50");

      expect(mockCreateTodoCategory).toHaveBeenCalledWith(
        "仕事",
        "bg-blue-50",
      );
    });

    it("空白のみの名前では追加せず同じ配列を返す", () => {
      const categories = [category()];

      const result = addTodoCategory(categories, "   ");

      expect(result).toBe(categories);
      expect(mockCreateTodoCategory).not.toHaveBeenCalled();
    });
  });

  describe("renameTodoCategory", () => {
    it("指定したidのカテゴリ名だけを変更する", () => {
      const categories = [
        category({ id: "cat-1", name: "仕事" }),
        category({ id: "cat-2", name: "プライベート" }),
      ];

      const result = renameTodoCategory(categories, "cat-1", "業務");

      expect(result).toEqual([
        category({ id: "cat-1", name: "業務" }),
        category({ id: "cat-2", name: "プライベート" }),
      ]);
    });

    it("該当するidがなければ変更されない", () => {
      const categories = [category({ id: "cat-1", name: "仕事" })];

      const result = renameTodoCategory(categories, "cat-404", "業務");

      expect(result).toEqual(categories);
    });
  });

  describe("updateTodoCategoryColor", () => {
    it("指定したidのカテゴリ色だけを変更する", () => {
      const categories = [
        category({ id: "cat-1", color: "bg-red-50" }),
        category({ id: "cat-2", color: "bg-green-50" }),
      ];

      const result = updateTodoCategoryColor(categories, "cat-1", "bg-blue-50");

      expect(result).toEqual([
        category({ id: "cat-1", color: "bg-blue-50" }),
        category({ id: "cat-2", color: "bg-green-50" }),
      ]);
    });

    it("undefinedを渡すとデフォルト色にクリアする", () => {
      const categories = [category({ id: "cat-1", color: "bg-red-50" })];

      const result = updateTodoCategoryColor(categories, "cat-1", undefined);

      expect(result[0].color).toBeUndefined();
    });

    it("該当するidがなければ変更されない", () => {
      const categories = [category({ id: "cat-1", color: "bg-red-50" })];

      const result = updateTodoCategoryColor(
        categories,
        "cat-404",
        "bg-blue-50",
      );

      expect(result).toEqual(categories);
    });
  });

  describe("removeTodoCategory", () => {
    it("指定したidのカテゴリを取り除く", () => {
      const categories = [
        category({ id: "cat-1", name: "仕事" }),
        category({ id: "cat-2", name: "プライベート" }),
      ];

      const result = removeTodoCategory(categories, "cat-1");

      expect(result).toEqual([category({ id: "cat-2", name: "プライベート" })]);
    });
  });
});
