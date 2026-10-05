/** @jest-environment node */
import {
  applyListPatch,
  createTodoList,
  updateListItems,
} from "../../operations/todo/todoListEntity";
import type { TodoItem, TodoList } from "../../operations/todo/todoTypes";

const NOW = new Date("2026-10-05T00:00:00.000Z");
const ISO = NOW.toISOString();

const baseList: TodoList = {
  id: "l1",
  title: "リスト",
  items: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

describe("createTodoList", () => {
  it("ID・空配列・タイムスタンプを持つ TodoList を生成する", () => {
    const list = createTodoList({ title: "買い物" }, NOW);
    expect(list.id).toMatch(/^todo-list-\d+-[a-z0-9]+$/);
    expect(list).toMatchObject({
      title: "買い物",
      items: [],
      createdAt: ISO,
      updatedAt: ISO,
    });
  });

  it("defaultItemBgColor を指定した場合は設定される", () => {
    const list = createTodoList(
      { title: "仕事", defaultItemBgColor: "bg-red-50", addItemPosition: "first" },
      NOW,
    );
    expect(list.defaultItemBgColor).toBe("bg-red-50");
    expect(list.addItemPosition).toBe("first");
  });

  it("defaultItemBgColor が null の場合はプロパティを設定しない", () => {
    const list = createTodoList(
      { title: "メモ", defaultItemBgColor: null },
      NOW,
    );
    expect("defaultItemBgColor" in list).toBe(false);
  });
});

describe("applyListPatch", () => {
  it("指定フィールドを更新し updatedAt を更新する", () => {
    const updated = applyListPatch(
      baseList,
      { title: "新リスト", isHidden: true },
      NOW,
    );
    expect(updated).toEqual({
      ...baseList,
      title: "新リスト",
      isHidden: true,
      updatedAt: ISO,
    });
  });

  it("defaultItemBgColor を null にするとプロパティが削除される", () => {
    const coloredList: TodoList = {
      ...baseList,
      defaultItemBgColor: "bg-blue-50",
    };
    const updated = applyListPatch(
      coloredList,
      { defaultItemBgColor: null },
      NOW,
    );
    expect("defaultItemBgColor" in updated).toBe(false);
    expect(updated.updatedAt).toBe(ISO);
  });
});

describe("updateListItems", () => {
  it("items を差し替え updatedAt を現在日時に更新する", () => {
    const item: TodoItem = {
      id: "it-1",
      title: "タスク",
      isCompleted: false,
      createdAt: "2026-10-01T00:00:00.000Z",
    };
    const updated = updateListItems(baseList, [item], NOW);
    expect(updated).toEqual({
      ...baseList,
      items: [item],
      updatedAt: ISO,
    });
  });
});
