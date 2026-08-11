import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import {
  STORAGE_WRITE_FAILED_EVENT,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "@/lib/storage/core";
// 公開 API を最小に保つため、バレルには載せず内部モジュールから直接取る
import { dispatchStorageWriteFailed } from "@/lib/storage/core-modules/storageWriteFailureEvent";
import { useStorageWriteFailure } from "../useStorageWriteFailure";

/** 書き込み失敗イベントを発火する */
const emitFailure = (detail: StorageWriteFailureDetail) => {
  act(() => {
    window.dispatchEvent(
      new CustomEvent<StorageWriteFailureDetail>(STORAGE_WRITE_FAILED_EVENT, {
        detail,
      }),
    );
  });
};

describe("useStorageWriteFailure", () => {
  afterEach(() => {
    // 取りこぼし用のバッファがテスト間で持ち越されないようにする
    replayLastStorageWriteFailure();
  });

  it("購読を始める前に起きた失敗も拾う", () => {
    // React は子の effect を親より先に実行する。アプリ全体を包む側で
    // 購読していると、子のマウント処理で起きた失敗はリスナーが張られる前に
    // 発火してしまい、そのままでは取りこぼす。
    dispatchStorageWriteFailed(
      "todo-lists",
      new DOMException("full", "QuotaExceededError"),
    );

    const { result } = renderHook(() => useStorageWriteFailure());

    expect(result.current.failure).toEqual({
      key: "todo-lists",
      reason: "quota-exceeded",
    });
  });

  it("取りこぼしを拾ったあと dismiss すれば消える", () => {
    dispatchStorageWriteFailed("todo-lists", new Error("boom"));
    const { result } = renderHook(() => useStorageWriteFailure());

    act(() => result.current.dismiss());

    expect(result.current.failure).toBeNull();
  });

  it("初期状態では失敗を保持していない", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    expect(result.current.failure).toBeNull();
  });

  it("イベントを受け取ると failure に反映する", () => {
    const { result } = renderHook(() => useStorageWriteFailure());

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(result.current.failure).toEqual({
      key: "todo-lists",
      reason: "quota-exceeded",
    });
  });

  it("dismiss で消える", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    act(() => result.current.dismiss());

    expect(result.current.failure).toBeNull();
  });

  it("dismiss したあとに再び失敗すると再表示される", () => {
    // 容量超過は解消されない限り書き込みのたびに起きる。
    // 一度閉じたきり二度と出ないと、消え続けるデータに気づけない。
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    act(() => result.current.dismiss());

    emitFailure({ key: "routines", reason: "unknown" });

    expect(result.current.failure).toEqual({
      key: "routines",
      reason: "unknown",
    });
  });

  it("同じ内容の失敗が続いても状態を差し替えない", () => {
    // 容量超過は解消されない限り書き込みのたびに起きる。
    // 毎回状態を差し替えると再描画が走り続け、その再描画中の書き込みが
    // また失敗すると連鎖が止まらなくなる。
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    const first = result.current.failure;

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(result.current.failure).toBe(first);
  });

  it("キーが変わったら状態を差し替える", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    const first = result.current.failure;

    emitFailure({ key: "routines", reason: "quota-exceeded" });

    expect(result.current.failure).not.toBe(first);
    expect(result.current.failure?.key).toBe("routines");
  });

  it("理由が変わったら状態を差し替える", () => {
    const { result } = renderHook(() => useStorageWriteFailure());
    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });
    const first = result.current.failure;

    emitFailure({ key: "todo-lists", reason: "unknown" });

    expect(result.current.failure).not.toBe(first);
    expect(result.current.failure?.reason).toBe("unknown");
  });

  it("アンマウント後はリスナーを解除する", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useStorageWriteFailure());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      STORAGE_WRITE_FAILED_EVENT,
      expect.any(Function),
    );
    removeSpy.mockRestore();
  });

  it("StrictMode の二重マウントでも反映される", () => {
    // 開発時の StrictMode ではマウント→クリーンアップ→マウントが走る。
    // 解除したまま張り直さないとイベントを取りこぼす。
    const { result } = renderHook(() => useStorageWriteFailure(), {
      wrapper: StrictMode,
    });

    emitFailure({ key: "todo-lists", reason: "quota-exceeded" });

    expect(result.current.failure).toEqual({
      key: "todo-lists",
      reason: "quota-exceeded",
    });
  });
});
