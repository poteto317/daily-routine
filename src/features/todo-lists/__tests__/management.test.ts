import {
  addTodoList,
  removeTodoList,
  toggleTodoListVisibility,
} from "../management";
import { normalizeTodoTitle } from "../todoListTitleNormalization";
import type { TodoList } from "../types";

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTodoTitle: jest.fn(),
}));

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todo list management", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTodoTitle as jest.Mock).mockImplementation(
      real.normalizeTodoTitle,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("空白のみのタイトルは追加しない", () => {
    const lists = [createList()];
    expect(addTodoList(lists, "   ")).toBe(lists);
  });

  it("タイトルを trim してリストを追加する", () => {
    const result = addTodoList([], "  New List  ");
    expect(result).toEqual([expect.objectContaining({ title: "New List" })]);
  });

  it("表示状態を切り替える", () => {
    expect(toggleTodoListVisibility([createList()], "list-1")).toEqual([
      expect.objectContaining({ isHidden: true }),
    ]);
  });

  it("指定IDのリストを削除する", () => {
    const result = removeTodoList(
      [createList(), createList({ id: "list-2" })],
      "list-1",
    );
    expect(result).toEqual([expect.objectContaining({ id: "list-2" })]);
  });

  it("addTodoList は normalizeTodoTitle に委譲する", () => {
    (normalizeTodoTitle as jest.Mock).mockReturnValue("NormalizedTitle");

    const result = addTodoList([], "  raw title  ");

    expect(normalizeTodoTitle).toHaveBeenCalledWith("  raw title  ");
    expect(result).toEqual([
      expect.objectContaining({ title: "NormalizedTitle" }),
    ]);
  });

  it("normalizeTodoTitle が null を返すとリストを追加しない", () => {
    const lists = [createList()];
    (normalizeTodoTitle as jest.Mock).mockReturnValue(null);

    const result = addTodoList(lists, "   ");

    expect(result).toBe(lists);
  });
});
