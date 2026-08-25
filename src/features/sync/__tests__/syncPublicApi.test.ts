describe("sync public API", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("同期操作の読込時に管理ページを評価しない", () => {
    jest.doMock("../SyncManagementPage", () => {
      throw new Error("SyncManagementPage was loaded eagerly");
    });

    expect(() => jest.requireActual("../index")).not.toThrow();
  });
});
