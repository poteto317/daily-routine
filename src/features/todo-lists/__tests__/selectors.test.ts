import { findTodoListById, resolveSelectedTodoListId } from "../selectors";
import { isTodoListVisible } from "../todoListVisibilityPredicate";
import type { TodoList } from "../types";

jest.mock("../todoListVisibilityPredicate", () => ({
  ...jest.requireActual("../todoListVisibilityPredicate"),
  isTodoListVisible: jest.fn(),
}));

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todo list selectors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListVisibilityPredicate")
    >("../todoListVisibilityPredicate");
    (isTodoListVisible as jest.Mock).mockImplementation(real.isTodoListVisible);
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
    expect(
      resolveSelectedTodoListId([createList({ isHidden: true })], null),
    ).toBeNull();
  });

  it("IDでリストを取得する", () => {
    const lists = [createList(), createList({ id: "list-2" })];

    expect(findTodoListById(lists, "list-2")).toEqual(
      expect.objectContaining({ id: "list-2" }),
    );
    expect(findTodoListById(lists, "missing")).toBeNull();
  });

  it("resolveSelectedTodoListId は isTodoListVisible に委譲して可視リストを絞り込む", () => {
    const hidden = createList({ id: "hidden" });
    const visible = createList({ id: "visible" });

    // hidden を非表示扱いにする
    (isTodoListVisible as jest.Mock).mockImplementation(
      (list: TodoList) => list.id !== "hidden",
    );

    const result = resolveSelectedTodoListId([hidden, visible], "missing");

    expect(isTodoListVisible).toHaveBeenCalled();
    expect(result).toBe("visible");
  });
});
