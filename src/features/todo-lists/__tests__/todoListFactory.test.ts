import type { TodoListItem } from "../types";
import {
  createTodoList,
  createTodoListItem,
  generateId,
} from "../todoListFactory";

describe("todoListFactory", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    jest.spyOn(Date, "now").mockReturnValue(12345);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("generateId", () => {
    it("Date.now と Math.random を組み合わせた文字列を返す", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("呼ぶたびに異なる ID を生成する（Math.random が変わる場合）", () => {
      let call = 0;
      jest
        .spyOn(Math, "random")
        .mockImplementation(() => (call++ === 0 ? 0.1 : 0.9));
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("createTodoList", () => {
    it("タイトルを持つ TodoList を生成する", () => {
      expect(createTodoList("Work")).toEqual({
        id: expect.any(String),
        title: "Work",
        items: [],
        createdAt: "2026-03-07T12:00:00.000Z",
        updatedAt: "2026-03-07T12:00:00.000Z",
      });
    });

    it("生成された items は空配列である", () => {
      const list = createTodoList("Empty");
      expect(list.items).toEqual([]);
    });

    it("createdAt と updatedAt が同じ ISO 文字列になる", () => {
      const list = createTodoList("Test");
      expect(list.createdAt).toBe(list.updatedAt);
    });

    it("タイトルが空文字でも生成できる", () => {
      const list = createTodoList("");
      expect(list.title).toBe("");
    });

    it("異なる呼び出しで異なる id を生成する", () => {
      let call = 0;
      jest
        .spyOn(Math, "random")
        .mockImplementation(() => (call++ % 2 === 0 ? 0.1 : 0.9));
      const list1 = createTodoList("A");
      const list2 = createTodoList("B");
      expect(list1.id).not.toBe(list2.id);
    });
  });

  describe("createTodoListItem", () => {
    it("タイトルを持つ TodoListItem を生成する", () => {
      expect(createTodoListItem("Write tests")).toEqual<TodoListItem>({
        id: expect.any(String),
        title: "Write tests",
        isCompleted: false,
        createdAt: "2026-03-07T12:00:00.000Z",
      });
    });

    it("生成されたアイテムは isCompleted=false である", () => {
      const item = createTodoListItem("Task");
      expect(item.isCompleted).toBe(false);
    });

    it("indent や bgColor は含まれない", () => {
      const item = createTodoListItem("Task");
      expect(item).not.toHaveProperty("indent");
      expect(item).not.toHaveProperty("bgColor");
    });

    it("タイトルが正しくセットされる", () => {
      const item = createTodoListItem("Buy milk");
      expect(item.title).toBe("Buy milk");
    });
  });
});
