import { withSyncTimeout } from "../sync/withSyncTimeout";

describe("withSyncTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("処理が時間内に完了した場合は結果を返す", async () => {
    const fn = jest.fn().mockResolvedValue("success");

    const promise = withSyncTimeout(fn, 5000, "タイムアウト");
    jest.advanceTimersByTime(100);

    await expect(promise).resolves.toBe("success");
  });

  it("処理が時間内にエラーになった場合はそのエラーをそのまま reject する", async () => {
    const cause = new Error("original error");
    const fn = jest.fn().mockRejectedValue(cause);

    const promise = withSyncTimeout(fn, 5000, "タイムアウト");

    await expect(promise).rejects.toThrow("original error");
  });

  it("指定時間を超過した場合にタイムアウトメッセージで reject する", async () => {
    // 永遠に解決しない Promise
    const fn = jest.fn().mockReturnValue(new Promise(() => {}));

    const promise = withSyncTimeout(fn, 5000, "同期がタイムアウトしました");
    jest.advanceTimersByTime(5001);

    await expect(promise).rejects.toThrow("同期がタイムアウトしました");
  });

  it("処理が完了後はタイマーがクリアされる（メモリリーク防止）", async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");
    const fn = jest.fn().mockResolvedValue("done");

    await withSyncTimeout(fn, 5000, "タイムアウト");

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    clearTimeoutSpy.mockRestore();
  });

  it("エラー発生後はタイマーがクリアされる（メモリリーク防止）", async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, "clearTimeout");
    const fn = jest.fn().mockRejectedValue(new Error("fail"));

    await expect(withSyncTimeout(fn, 5000, "タイムアウト")).rejects.toThrow(
      "fail",
    );

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    clearTimeoutSpy.mockRestore();
  });

  it("タイムアウト後に元の処理が完了しても resolve されない（競合状態防止）", async () => {
    let resolveDelayed!: (value: string) => void;
    const delayedPromise = new Promise<string>((res) => {
      resolveDelayed = res;
    });
    const fn = jest.fn().mockReturnValue(delayedPromise);

    const promise = withSyncTimeout(fn, 5000, "同期がタイムアウトしました");
    jest.advanceTimersByTime(5001);

    // タイムアウトで reject されることを確認
    await expect(promise).rejects.toThrow("同期がタイムアウトしました");

    // タイムアウト後に元の処理が完了しても、settled フラグにより無視される
    resolveDelayed("late success");
    // promise は既に reject 済みのため変化しない（settled = true）
  });
});
