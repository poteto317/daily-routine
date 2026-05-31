import { updateTodoListTitleAndPersist } from "../todoListTitleUpdatePersistAction";
import type { TodoList } from "../types";

jest.mock("../todoListDetailActions", () => ({
  updateTodoListTitleInLists: jest.fn(),
}));

import { updateTodoListTitleInLists } from "../todoListDetailActions";

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("updateTodoListTitleAndPersist", () => {
  it("タイトルを更新して persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const nextLists = [createList({ title: "Updated" })];
    (updateTodoListTitleInLists as jest.Mock).mockReturnValue(nextLists);

    updateTodoListTitleAndPersist({
      lists,
      listId: "list-1",
      title: "Updated",
      persist,
    });

    expect(persist).toHaveBeenCalledWith(nextLists);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("更新後のリストを返す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const nextLists = [createList({ title: "NewTitle" })];
    (updateTodoListTitleInLists as jest.Mock).mockReturnValue(nextLists);

    const result = updateTodoListTitleAndPersist({
      lists,
      listId: "list-1",
      title: "NewTitle",
      persist,
    });

    expect(result).toBe(nextLists);
  });

  it("updateTodoListTitleInLists に正しいパラメータを渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    (updateTodoListTitleInLists as jest.Mock).mockReturnValue(lists);

    updateTodoListTitleAndPersist({
      lists,
      listId: "list-1",
      title: "My List",
      persist,
    });

    expect(updateTodoListTitleInLists).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      title: "My List",
    });
  });

  it("複数リストがあっても persist は一度だけ呼ばれる", () => {
    const lists = [
      createList(),
      createList({ id: "list-2", title: "Work" }),
      createList({ id: "list-3", title: "Personal" }),
    ];
    const persist = jest.fn();
    const nextLists = [...lists];
    (updateTodoListTitleInLists as jest.Mock).mockReturnValue(nextLists);

    updateTodoListTitleAndPersist({
      lists,
      listId: "list-2",
      title: "Work Updated",
      persist,
    });

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("persist に updateTodoListTitleInLists の戻り値をそのまま渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const transformed = [createList({ title: "Transformed" })];
    (updateTodoListTitleInLists as jest.Mock).mockReturnValue(transformed);

    updateTodoListTitleAndPersist({
      lists,
      listId: "list-1",
      title: "Transformed",
      persist,
    });

    expect(persist).toHaveBeenCalledWith(transformed);
  });
});
