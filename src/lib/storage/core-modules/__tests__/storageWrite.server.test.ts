/**
 * @jest-environment node
 */
import { getLocalDataUpdatedAt } from "../localDataUpdatedAt";
import { runStorageWrite } from "../storageWrite";
import {
  dispatchStorageWriteFailed,
  replayLastStorageWriteFailure,
} from "../storageWriteFailureEvent";

// window が無い環境（サーバー側レンダリング）では、保存処理は何もせずに終わる
describe("ストレージ書き込み（サーバー側）", () => {
  it("runStorageWrite は書き込みを実行せず false を返す", () => {
    const write = jest.fn();

    expect(runStorageWrite("todo-lists", write)).toBe(false);
    expect(write).not.toHaveBeenCalled();
  });

  it("失敗の通知と再送は例外を投げずに何もしない", () => {
    expect(() =>
      dispatchStorageWriteFailed("todo-lists", new Error("x")),
    ).not.toThrow();
    expect(() => replayLastStorageWriteFailure()).not.toThrow();
  });

  it("getLocalDataUpdatedAt は 0 を返す", () => {
    expect(getLocalDataUpdatedAt()).toBe(0);
  });
});
