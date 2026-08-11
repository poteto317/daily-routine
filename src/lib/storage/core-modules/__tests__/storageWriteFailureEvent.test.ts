import {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";

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

/**
 * リスナーが投げた例外を握り潰す。
 *
 * jsdom は例外を再スローしないが window の error イベントとして報告し、
 * jest-environment-jsdom がそれをテストの失敗として扱うため。
 */
const suppressListenerErrors = () => {
  const suppress = (event: ErrorEvent) => event.preventDefault();
  window.addEventListener("error", suppress);
  return () => window.removeEventListener("error", suppress);
};

describe("dispatchStorageWriteFailed", () => {
  afterEach(() => {
    // 取りこぼし用のバッファがテスト間で持ち越されないようにする
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

  it("リスナーの中から同期的に再度呼ばれても連鎖しない", () => {
    // リスナーの中で別の書き込みを行い、それも失敗したときの直接の連鎖を止める
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

  it("リスナーが例外を投げても再入ガードが残らない", () => {
    // finally で戻さないと、リスナーが 1 度落ちただけで
    // 以後の失敗が永久に通知されなくなる
    const restoreErrors = suppressListenerErrors();
    const throwing = () => {
      throw new Error("listener failed");
    };
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, throwing);
    dispatchStorageWriteFailed("first", new Error("boom"));
    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, throwing);
    restoreErrors();

    const { details, cleanup } = listenFailures();
    dispatchStorageWriteFailed("second", new Error("boom"));

    expect(details.map((d) => d.key)).toEqual(["second"]);
    cleanup();
  });
});

describe("replayLastStorageWriteFailure", () => {
  afterEach(() => {
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

  it("リスナーが受け取った失敗も再送の対象になる", () => {
    // 受け取れたかどうかは追跡していない。購読側はルートレイアウトに 1 つだけ
    // 置かれて再マウントしないため実害は無いが、追跡していないという事実を
    // ここで固定し、JSDoc の説明と食い違わないようにする。
    const first = listenFailures();
    dispatchStorageWriteFailed("todo-lists", new Error("boom"));
    expect(first.details).toHaveLength(1);
    first.cleanup();

    const second = listenFailures();
    replayLastStorageWriteFailure();

    expect(second.details).toEqual([{ key: "todo-lists", reason: "unknown" }]);
    second.cleanup();
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
