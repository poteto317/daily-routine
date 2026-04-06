import {
  LOCAL_DATA_UPDATED_AT_EVENT,
  getCurrentUserId,
  getStorageItem,
  getUnscopedStorageItem,
  getUserScopedKey,
  migrateToUserStorage,
  removeStorageItem,
  removeUnscopedStorageItem,
  setCurrentUserId,
  setStorageItem,
  setUnscopedStorageItem,
  withSyncBatch,
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

  it("unscoped storage helperはcurrentUserIdに影響されない固定キーを使う", () => {
    setCurrentUserId("uid-1");

    setUnscopedStorageItem(
      "local-dev-auth-user",
      { uid: "local-user" },
      {
        skipLocalDataUpdatedAt: true,
      },
    );

    expect(getUnscopedStorageItem("local-dev-auth-user", null)).toEqual({
      uid: "local-user",
    });
    expect(localStorage.getItem("local-dev-auth-user")).toBe(
      JSON.stringify({ uid: "local-user" }),
    );
    expect(localStorage.getItem("user:uid-1:local-dev-auth-user")).toBeNull();

    removeUnscopedStorageItem("local-dev-auth-user", {
      skipLocalDataUpdatedAt: true,
    });

    expect(localStorage.getItem("local-dev-auth-user")).toBeNull();
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

describe("withSyncBatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    setCurrentUserId("uid-1");
  });

  it("バッチ中は setStorageItem が setLocalDataUpdatedAt を呼ばない", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    withSyncBatch(() => {
      setStorageItem("daily-routines", [{ id: "r1" }]);
      setStorageItem("daily-routines", [{ id: "r2" }]);
    });

    // バッチ中の2回の setStorageItem ではイベントが発火しない
    // バッチ自体は setLocalDataUpdatedAt を呼ばないため、イベントも発火しない
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
    );

    dispatchSpy.mockRestore();
  });

  it("バッチ後に手動で setLocalDataUpdatedAt を呼ぶとイベントが1回だけ発火する", () => {
    const { setLocalDataUpdatedAt } = jest.requireActual(
      "../core",
    ) as typeof import("../core");
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    withSyncBatch(() => {
      setStorageItem("daily-routines", [{ id: "r1" }]);
      setStorageItem("app-settings", { theme: "dark" });
    });
    setLocalDataUpdatedAt(Date.now());

    const calls = dispatchSpy.mock.calls.filter(
      ([e]) =>
        e instanceof CustomEvent && e.type === LOCAL_DATA_UPDATED_AT_EVENT,
    );
    expect(calls).toHaveLength(1);

    dispatchSpy.mockRestore();
  });

  it("バッチ外では setStorageItem が即座に setLocalDataUpdatedAt を呼ぶ", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    setStorageItem("daily-routines", [{ id: "r1" }]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
    );

    dispatchSpy.mockRestore();
  });

  it("async 関数を渡すと実行前に例外を投げる", () => {
    // AsyncFunction 判定は fn() 実行前に行なわれるため、副作用は発生しない
    const asyncFn = async () => {
      setStorageItem("daily-routines", []);
    };
    expect(() => withSyncBatch(asyncFn as unknown as () => void)).toThrow(
      "withSyncBatch には同期関数のみ渡してください",
    );
  });

  it("Promise を返す関数で例外後も syncBatchDepth が正しく戻る（次のバッチが正常動作する）", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    // () => Promise.resolve() は通常関数だが Promise を返す。
    // syncBatchDepth++ 後に instanceof Promise で例外を投げ、
    // finally で depth が 0 に戻ることを確認する。
    // （async 関数は syncBatchDepth++ 前に弾かれるため、そのパスでは深度は変化しない）
    try {
      withSyncBatch((() => Promise.resolve()) as unknown as () => void);
    } catch {
      // 例外は想定内
    }

    // 深度が正しく 0 に戻っていれば、バッチ外では即座にイベントが発火する
    setStorageItem("daily-routines", [{ id: "r1" }]);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: LOCAL_DATA_UPDATED_AT_EVENT }),
    );

    dispatchSpy.mockRestore();
  });
});
