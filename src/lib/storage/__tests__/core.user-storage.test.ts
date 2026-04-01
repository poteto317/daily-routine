import {
  LOCAL_DATA_UPDATED_AT_EVENT,
  getCurrentUserId,
  getStorageItem,
  getUserScopedKey,
  migrateToUserStorage,
  removeStorageItem,
  setCurrentUserId,
  setStorageItem,
} from "../core";

describe("storage/core user storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    setCurrentUserId(null);
  });

  it("setCurrentUserId/getCurrentUserId/getUserScopedKeyがユーザースコープを管理する", () => {
    expect(getCurrentUserId()).toBeNull();
    expect(getUserScopedKey("daily-routines")).toBe("daily-routines");

    setCurrentUserId("uid-1");

    expect(getCurrentUserId()).toBe("uid-1");
    expect(getUserScopedKey("daily-routines")).toBe(
      "user:uid-1:daily-routines",
    );
  });

  it("getStorageItem/setStorageItemはユーザースコープ付きキーで読み書きする", () => {
    setCurrentUserId("uid-1");

    setStorageItem("daily-routines", [{ id: "r1" }]);
    const result = getStorageItem(
      "daily-routines",
      [] as Array<{ id: string }>,
    );

    expect(localStorage.getItem("user:uid-1:daily-routines")).toBe(
      JSON.stringify([{ id: "r1" }]),
    );
    expect(
      localStorage.getItem("user:uid-1:local-data-updated-at"),
    ).not.toBeNull();
    expect(result).toEqual([{ id: "r1" }]);
  });

  it("setStorageItemはskipLocalDataUpdatedAt指定時に更新時刻を書き換えない", () => {
    setCurrentUserId("uid-1");

    setStorageItem(
      "daily-progress",
      { date: "2026-02-13" },
      {
        skipLocalDataUpdatedAt: true,
      },
    );

    expect(localStorage.getItem("user:uid-1:daily-progress")).toBe(
      JSON.stringify({ date: "2026-02-13" }),
    );
    expect(localStorage.getItem("user:uid-1:local-data-updated-at")).toBeNull();
  });

  it("setStorageItemはローカル更新イベントを発火する", () => {
    setCurrentUserId("uid-1");
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    setStorageItem("daily-routines", [{ id: "r1" }]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
    );

    dispatchSpy.mockRestore();
  });

  it("removeStorageItemはユーザースコープ付きキーを削除する", () => {
    setCurrentUserId("uid-1");
    localStorage.setItem(
      "user:uid-1:daily-routines",
      JSON.stringify([{ id: "r1" }]),
    );

    removeStorageItem("daily-routines", {
      skipLocalDataUpdatedAt: true,
    });

    expect(localStorage.getItem("user:uid-1:daily-routines")).toBeNull();
  });

  it("removeStorageItemはローカル更新イベント用の更新時刻を書き換える", () => {
    setCurrentUserId("uid-1");
    localStorage.setItem(
      "user:uid-1:daily-routines",
      JSON.stringify([{ id: "r1" }]),
    );

    removeStorageItem("daily-routines");

    expect(
      localStorage.getItem("user:uid-1:local-data-updated-at"),
    ).not.toBeNull();
  });

  it("migrateToUserStorageは未スコープデータをユーザースコープへ移行する", () => {
    localStorage.setItem("daily-routines", JSON.stringify([{ id: "r1" }]));
    localStorage.setItem("app-settings", JSON.stringify({ theme: "dark" }));

    migrateToUserStorage("uid-1");

    expect(localStorage.getItem("user:uid-1:daily-routines")).toBe(
      JSON.stringify([{ id: "r1" }]),
    );
    expect(localStorage.getItem("user:uid-1:app-settings")).toBe(
      JSON.stringify({ theme: "dark" }),
    );
    expect(localStorage.getItem("user:uid-1:_migrated")).toBe("true");
  });

  it("migrateToUserStorageは既に移行済みなら再実行しない", () => {
    localStorage.setItem("daily-routines", JSON.stringify([{ id: "r1" }]));
    localStorage.setItem("user:uid-1:_migrated", "true");

    migrateToUserStorage("uid-1");

    expect(localStorage.getItem("user:uid-1:daily-routines")).toBeNull();
  });
});
