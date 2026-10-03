import { act, renderHook } from "@testing-library/react";
import texts from "../locales/ja.json";
import { useCopyApiKey } from "../useCopyApiKey";

const mockClipboard = (writeText: jest.Mock | undefined) => {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
};

describe("useCopyApiKey", () => {
  it("キーをクリップボードへ書き込み、copied を true にする", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    const { result } = renderHook(() => useCopyApiKey("drk_x", jest.fn()));
    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith("drk_x");
    expect(result.current.copied).toBe(true);
  });

  it("キーが無いときは何もしない", async () => {
    const writeText = jest.fn();
    mockClipboard(writeText);
    const { result } = renderHook(() => useCopyApiKey(null, jest.fn()));

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });

  it("書き込みに失敗したら onError にメッセージを渡し、copied は false のまま", async () => {
    mockClipboard(jest.fn().mockRejectedValue(new Error("denied")));
    const onError = jest.fn();
    const { result } = renderHook(() => useCopyApiKey("drk_x", onError));

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(onError).toHaveBeenCalledWith(texts.errors.copy);
    expect(result.current.copied).toBe(false);
  });

  it("コピー成功後の再試行が失敗したら copied を false に戻し、エラーと同時に成功表示を出さない", async () => {
    const writeText = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("denied"));
    mockClipboard(writeText);
    const onError = jest.fn();
    const { result } = renderHook(() => useCopyApiKey("drk_x", onError));

    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(result.current.copied).toBe(false);
    expect(onError).toHaveBeenCalledWith(texts.errors.copy);
  });

  it("クリップボード API が無い環境でも onError で通知する", async () => {
    mockClipboard(undefined);
    const onError = jest.fn();
    const { result } = renderHook(() => useCopyApiKey("drk_x", onError));

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(onError).toHaveBeenCalledWith(texts.errors.copy);
  });

  it("resetCopied で copied を false に戻す", async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    const { result } = renderHook(() => useCopyApiKey("drk_x", jest.fn()));
    await act(async () => {
      await result.current.handleCopy();
    });

    act(() => result.current.resetCopied());

    expect(result.current.copied).toBe(false);
  });

  it("コピーに成功したら onSuccess を呼び、失敗したときは呼ばない", async () => {
    const writeText = jest
      .fn()
      .mockRejectedValueOnce(new Error("denied"))
      .mockResolvedValueOnce(undefined);
    mockClipboard(writeText);
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useCopyApiKey("drk_x", jest.fn(), onSuccess),
    );

    await act(async () => {
      await result.current.handleCopy();
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.handleCopy();
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.copied).toBe(true);
  });

  it("onSuccess を渡さなくてもコピーできる（省略可能）", async () => {
    mockClipboard(jest.fn().mockResolvedValue(undefined));
    const { result } = renderHook(() => useCopyApiKey("drk_x", jest.fn()));
    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.copied).toBe(true);
  });
});
