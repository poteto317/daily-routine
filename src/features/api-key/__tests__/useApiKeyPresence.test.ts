import { act, renderHook, waitFor } from "@testing-library/react";
import * as service from "../apiKeyService";
import { useApiKeyPresence } from "../useApiKeyPresence";

jest.mock("../apiKeyService");
const mockedService = jest.mocked(service);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useApiKeyPresence", () => {
  it("取得前は null、取得後は有無を返す", async () => {
    mockedService.hasApiKey.mockResolvedValue(true);
    const { result } = renderHook(() =>
      useApiKeyPresence({ onLoadError: jest.fn() }),
    );
    expect(result.current.hasKey).toBeNull();
    await waitFor(() => expect(result.current.hasKey).toBe(true));
  });

  it("取得に失敗したら onLoadError を呼び、hasKey は null のまま", async () => {
    mockedService.hasApiKey.mockRejectedValue(new Error("x"));
    const onLoadError = jest.fn();
    const { result } = renderHook(() => useApiKeyPresence({ onLoadError }));
    await waitFor(() => expect(onLoadError).toHaveBeenCalledTimes(1));
    expect(result.current.hasKey).toBeNull();
  });

  it("setHasKey で値を更新できる", async () => {
    mockedService.hasApiKey.mockResolvedValue(false);
    const { result } = renderHook(() =>
      useApiKeyPresence({ onLoadError: jest.fn() }),
    );
    // 初回取得の完了（状態更新）を act 内で待つ
    await act(async () => {});
    expect(result.current.hasKey).toBe(false);

    act(() => result.current.setHasKey(true));
    expect(result.current.hasKey).toBe(true);
  });

  it("onLoadError の参照が変わっても再取得しない", async () => {
    mockedService.hasApiKey.mockResolvedValue(true);
    const { result, rerender } = renderHook(() =>
      useApiKeyPresence({ onLoadError: jest.fn() }),
    );
    await act(async () => {});
    rerender();
    rerender();
    expect(result.current.hasKey).toBe(true);
    expect(mockedService.hasApiKey).toHaveBeenCalledTimes(1);
  });

  it("最新の onLoadError を呼ぶ（取得中に参照が差し替わった場合）", async () => {
    let reject: (reason: Error) => void = () => {};
    mockedService.hasApiKey.mockReturnValue(
      new Promise<boolean>((_, r) => {
        reject = r;
      }),
    );
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ onLoadError }) => useApiKeyPresence({ onLoadError }),
      { initialProps: { onLoadError: first } },
    );
    rerender({ onLoadError: second });
    await act(async () => {
      reject(new Error("x"));
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("アンマウント後に取得が完了しても状態更新・通知をしない", async () => {
    let resolve: (value: boolean) => void = () => {};
    mockedService.hasApiKey.mockReturnValue(
      new Promise<boolean>((r) => {
        resolve = r;
      }),
    );
    const onLoadError = jest.fn();
    const { result, unmount } = renderHook(() =>
      useApiKeyPresence({ onLoadError }),
    );
    unmount();
    await act(async () => {
      resolve(true);
    });
    expect(result.current.hasKey).toBeNull();
    expect(onLoadError).not.toHaveBeenCalled();
  });
});
