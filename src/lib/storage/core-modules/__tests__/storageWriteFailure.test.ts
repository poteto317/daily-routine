import {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  isQuotaExceededError,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "../storageWriteFailure";

/** 発火された detail を集めるリスナーを張る */
const listenFailures = () => {
  const details: StorageWriteFailureDetail[] = [];
  const handle = (event: Event) => {
    details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
  };
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  return {
    details,
    cleanup: () =>
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle),
  };
};

describe("isQuotaExceededError", () => {
  it("QuotaExceededError を上限超過と判定する（Chrome/Safari）", () => {
    expect(
      isQuotaExceededError(new DOMException("full", "QuotaExceededError")),
    ).toBe(true);
  });

  it("NS_ERROR_DOM_QUOTA_REACHED を上限超過と判定する（Firefox）", () => {
    expect(
      isQuotaExceededError(
        new DOMException("full", "NS_ERROR_DOM_QUOTA_REACHED"),
      ),
    ).toBe(true);
  });

  it("それ以外の DOMException は上限超過としない", () => {
    expect(
      isQuotaExceededError(new DOMException("denied", "SecurityError")),
    ).toBe(false);
  });

  it("DOMException 以外は上限超過としない", () => {
    expect(isQuotaExceededError(new Error("QuotaExceededError"))).toBe(false);
    expect(isQuotaExceededError(undefined)).toBe(false);
  });
});

describe("replayLastStorageWriteFailure", () => {
  afterEach(() => {
    // バッファがテスト間で持ち越されないようにする
    replayLastStorageWriteFailure();
  });

  it("リスナーが居ない間に起きた失敗を後から再送する", () => {
    // アプリの起動直後、購読側がリスナーを張る前に書き込みが失敗しうる。
    // React は子の effect を親より先に実行するため、子のマウント処理で
    // 失敗しても、親が張るリスナーはまだ存在しない。
    dispatchStorageWriteFailed(
      "todo-lists",
      new DOMException("full", "QuotaExceededError"),
    );
    const { details, cleanup } = listenFailures();

    replayLastStorageWriteFailure();

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("一度再送したら消える", () => {
    dispatchStorageWriteFailed("todo-lists", new Error("boom"));
    replayLastStorageWriteFailure();
    const { details, cleanup } = listenFailures();

    replayLastStorageWriteFailure();

    expect(details).toEqual([]);
    cleanup();
  });

  it("失敗が起きていなければ何も発火しない", () => {
    const { details, cleanup } = listenFailures();

    replayLastStorageWriteFailure();

    expect(details).toEqual([]);
    cleanup();
  });

  it("複数回失敗したときは最後の失敗を再送する", () => {
    dispatchStorageWriteFailed("first", new Error("boom"));
    dispatchStorageWriteFailed(
      "second",
      new DOMException("full", "QuotaExceededError"),
    );
    const { details, cleanup } = listenFailures();

    replayLastStorageWriteFailure();

    expect(details).toEqual([{ key: "second", reason: "quota-exceeded" }]);
    cleanup();
  });
});

describe("dispatchStorageWriteFailed", () => {
  afterEach(() => {
    replayLastStorageWriteFailure();
  });

  it("キーと理由を載せてイベントを発火する", () => {
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed(
      "todo-lists",
      new DOMException("full", "QuotaExceededError"),
    );

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("上限超過でないエラーは unknown として発火する", () => {
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed("routines", new Error("boom"));

    expect(details).toEqual([{ key: "routines", reason: "unknown" }]);
    cleanup();
  });

  it("リスナーの中から再度呼ばれても無限に連鎖しない", () => {
    // バナーの再描画をきっかけに別の書き込みが走って失敗すると、
    // 通知→書き込み→失敗→通知…と連鎖しうる。発火中の再入は無視する。
    const details: StorageWriteFailureDetail[] = [];
    const handle = (event: Event) => {
      details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
      dispatchStorageWriteFailed("nested", new Error("boom"));
    };
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);

    dispatchStorageWriteFailed("outer", new Error("boom"));

    expect(details).toHaveLength(1);
    expect(details[0].key).toBe("outer");
    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  });

  it("再入を弾いたあとも次の発火は通常どおり行われる", () => {
    // 再入ガードのフラグが立ちっぱなしになると、以後の失敗が
    // 一切通知されなくなる
    const { details, cleanup } = listenFailures();

    dispatchStorageWriteFailed("first", new Error("boom"));
    dispatchStorageWriteFailed("second", new Error("boom"));

    expect(details.map((d) => d.key)).toEqual(["first", "second"]);
    cleanup();
  });
});
