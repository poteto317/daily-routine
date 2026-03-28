describe("selectedTodoList", () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it("保存済みの選択リストIDを復元する", async () => {
    await jest.isolateModulesAsync(async () => {
      const { saveSelectedTodoListId } = await import("../storage");
      saveSelectedTodoListId("list-1");

      const { getSelectedTodoListId } = await import("../selectedTodoList");

      expect(getSelectedTodoListId()).toBe("list-1");
    });
  });

  it("選択リストIDの更新を永続化して購読者へ通知する", async () => {
    await jest.isolateModulesAsync(async () => {
      const listener = jest.fn();
      const { getStoredSelectedTodoListId } = await import("../storage");
      const {
        getSelectedTodoListId,
        setSelectedTodoListId,
        subscribeSelectedTodoListId,
      } = await import("../selectedTodoList");

      const unsubscribe = subscribeSelectedTodoListId(listener);
      setSelectedTodoListId("list-2");

      expect(getSelectedTodoListId()).toBe("list-2");
      expect(getStoredSelectedTodoListId()).toBe("list-2");
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      setSelectedTodoListId(null);

      expect(getStoredSelectedTodoListId()).toBeNull();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
