import { runStorageWrite } from "../storageWrite";
import {
  STORAGE_WRITE_FAILED_EVENT,
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

describe("runStorageWrite", () => {
  afterEach(() => {
    // 取りこぼし用のバッファがテスト間で持ち越されないようにする
    replayLastStorageWriteFailure();
  });

  it("渡した書き込みを実行する", () => {
    const write = jest.fn();

    runStorageWrite("todo-lists", write);

    expect(write).toHaveBeenCalledTimes(1);
  });

  it("成功したときは通知しない", () => {
    const { details, cleanup } = listenFailures();

    const succeeded = runStorageWrite("todo-lists", () => {});

    expect(succeeded).toBe(true);
    expect(details).toEqual([]);
    cleanup();
  });

  it("書き込みが投げた例外を通知に変換する", () => {
    const { details, cleanup } = listenFailures();

    const succeeded = runStorageWrite("todo-lists", () => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(succeeded).toBe(false);
    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("例外を呼び出し元へ再スローしない", () => {
    // 保存に失敗しても操作自体は続けられる必要がある。
    // 例外が漏れると呼び出し側の処理が途中で止まる。
    expect(() =>
      runStorageWrite("todo-lists", () => {
        throw new Error("boom");
      }),
    ).not.toThrow();
  });
});
