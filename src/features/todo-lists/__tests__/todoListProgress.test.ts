import type { TodoList, TodoListItem } from "../types";
import { getListProgress } from "../todoListProgress";
import { isItemCompleted } from "../todoListItemCompletedPredicate";

jest.mock("../todoListItemCompletedPredicate", () => ({
  ...jest.requireActual("../todoListItemCompletedPredicate"),
  isItemCompleted: jest.fn(),
}));

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todoListProgress", () => {
  beforeEach(() => {
    const real = jest.requireActual<
      typeof import("../todoListItemCompletedPredicate")
    >("../todoListItemCompletedPredicate");
    (isItemCompleted as jest.Mock).mockImplementation(real.isItemCompleted);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getListProgress", () => {
    it("アイテムがない場合は completed=0, total=0, percentage=0 を返す", () => {
      expect(getListProgress(createList({ items: [] }))).toEqual({
        completed: 0,
        total: 0,
        percentage: 0,
      });
    });

    it("全て未完了の場合は percentage=0 を返す", () => {
      const items = [createItem(), createItem({ id: "item-2" })];
      expect(getListProgress(createList({ items }))).toEqual({
        completed: 0,
        total: 2,
        percentage: 0,
      });
    });

    it("全て完了済みの場合は percentage=100 を返す", () => {
      const items = [
        createItem({ isCompleted: true }),
        createItem({ id: "item-2", isCompleted: true }),
      ];
      expect(getListProgress(createList({ items }))).toEqual({
        completed: 2,
        total: 2,
        percentage: 100,
      });
    });

    it("半分完了の場合は percentage=50 を返す", () => {
      const items = [
        createItem({ isCompleted: true }),
        createItem({ id: "item-2" }),
      ];
      expect(getListProgress(createList({ items }))).toEqual({
        completed: 1,
        total: 2,
        percentage: 50,
      });
    });

    it("端数は四捨五入（Math.round）する", () => {
      const items = [
        createItem({ id: "item-1", isCompleted: true }),
        createItem({ id: "item-2" }),
        createItem({ id: "item-3" }),
      ];
      const result = getListProgress(createList({ items }));
      expect(result.percentage).toBe(33);
    });

    it("isItemCompleted に委譲して完了数を計算する", () => {
      (isItemCompleted as jest.Mock).mockReturnValue(true);

      const items = [createItem(), createItem({ id: "item-2" })];
      const result = getListProgress(createList({ items }));

      expect(isItemCompleted).toHaveBeenCalledWith(
        expect.objectContaining({ id: "item-1" }),
        expect.any(Number),
        expect.any(Array),
      );
      expect(result.completed).toBe(2);
    });

    it("isItemCompleted が false を返す場合は completed=0 になる", () => {
      (isItemCompleted as jest.Mock).mockReturnValue(false);

      const items = [
        createItem({ isCompleted: true }),
        createItem({ id: "item-2", isCompleted: true }),
      ];
      const result = getListProgress(createList({ items }));

      expect(result.completed).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });
});
