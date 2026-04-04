import type { TodoList } from "../types";
import { persistTodoLists } from "../todoListPersistence";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListPersistence", () => {
  describe("persistTodoLists", () => {
    it("setLists に nextLists を渡す", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();

      persistTodoLists({ nextLists: [baseList], setLists, saveLists });

      expect(setLists).toHaveBeenCalledWith([baseList]);
    });

    it("saveLists に nextLists を渡す", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();

      persistTodoLists({ nextLists: [baseList], setLists, saveLists });

      expect(saveLists).toHaveBeenCalledWith([baseList]);
    });

    it("setLists と saveLists の両方を呼び出す", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();
      const nextLists = [baseList];

      persistTodoLists({ nextLists, setLists, saveLists });

      expect(setLists).toHaveBeenCalledTimes(1);
      expect(saveLists).toHaveBeenCalledTimes(1);
    });

    it("空のリストも正しく渡す", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();

      persistTodoLists({ nextLists: [], setLists, saveLists });

      expect(setLists).toHaveBeenCalledWith([]);
      expect(saveLists).toHaveBeenCalledWith([]);
    });

    it("渡した nextLists の参照をそのまま転送する", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();
      const nextLists = [baseList];

      persistTodoLists({ nextLists, setLists, saveLists });

      expect(setLists).toHaveBeenCalledWith(nextLists);
      expect(saveLists).toHaveBeenCalledWith(nextLists);
    });
  });
});
