import {
  findTodoListById,
  getVisibleTodoItems,
  resolveSelectedTodoListId,
} from "../selectors";
import type { TodoList, TodoListItem } from "../types";

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

describe("todo list selectors", () => {
  it("完了済みの表示切替に応じてアイテムを返す", () => {
    const items = [createItem({ isCompleted: true }), createItem({ id: "item-2" })];

    expect(getVisibleTodoItems(items, false)).toHaveLength(2);
    expect(getVisibleTodoItems(items, true)).toEqual([
      expect.objectContaining({ id: "item-2" }),
    ]);
  });

  it("選択中リストが表示可能ならそのまま返す", () => {
    const lists = [createList(), createList({ id: "list-2" })];
    expect(resolveSelectedTodoListId(lists, "list-2")).toBe("list-2");
  });

  it("選択中リストが無効なら最初の表示可能リストへフォールバックする", () => {
    const lists = [
      createList({ id: "hidden", isHidden: true }),
      createList({ id: "visible" }),
    ];

    expect(resolveSelectedTodoListId(lists, "missing")).toBe("visible");
  });

  it("表示可能なリストがない場合は null を返す", () => {
    expect(resolveSelectedTodoListId([createList({ isHidden: true })], null)).toBeNull();
  });

  it("IDでリストを取得する", () => {
    const lists = [createList(), createList({ id: "list-2" })];

    expect(findTodoListById(lists, "list-2")).toEqual(
      expect.objectContaining({ id: "list-2" }),
    );
    expect(findTodoListById(lists, "missing")).toBeNull();
  });
});
