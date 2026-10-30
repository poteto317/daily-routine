import { act, renderHook, waitFor } from "@testing-library/react";
import { useApiKeyState } from "../useApiKeyState";
import * as service from "../apiKeyService";
import texts from "../locales/ja.json";

jest.mock("../apiKeyService");
const mockedService = jest.mocked(service);

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
let confirmSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockedService.hasApiKey.mockResolvedValue(false);
  confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    delete (navigator as { clipboard?: unknown }).clipboard;
  }
});

describe("useApiKeyState", () => {
  it("マウント時にキーの有無を取得する", async () => {
    mockedService.hasApiKey.mockResolvedValue(true);
    const { result } = renderHook(() => useApiKeyState());
    expect(result.current.hasKey).toBeNull();
    await waitFor(() => expect(result.current.hasKey).toBe(true));
  });

  it("取得に失敗したらエラーメッセージを出す", async () => {
    mockedService.hasApiKey.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.error).toBe(texts.errors.load));
  });

  it("未発行なら確認なしで発行し、キーを保持する", async () => {
    mockedService.issueApiKey.mockResolvedValue("drk_new");
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.hasKey).toBe(false));

    await act(async () => {
      await result.current.handleIssue();
    });

    expect(window.confirm).not.toHaveBeenCalled();
    expect(result.current.issuedKey).toBe("drk_new");
    expect(result.current.hasKey).toBe(true);
  });

  it("発行済みなら確認し、キャンセルされたら発行しない", async () => {
    mockedService.hasApiKey.mockResolvedValue(true);
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.hasKey).toBe(true));

    await act(async () => {
      await result.current.handleIssue();
    });

    expect(window.confirm).toHaveBeenCalledWith(texts.confirmReissue);
    expect(mockedService.issueApiKey).not.toHaveBeenCalled();
  });

  it("発行に失敗したらエラーを出し、キーは保持しない", async () => {
    mockedService.issueApiKey.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.hasKey).toBe(false));

    await act(async () => {
      await result.current.handleIssue();
    });

    expect(result.current.error).toBe(texts.errors.issue);
    expect(result.current.issuedKey).toBeNull();
    expect(result.current.isWorking).toBe(false);
  });

  it("失効すると hasKey=false になり、表示中のキーも消える", async () => {
    mockedService.hasApiKey.mockResolvedValue(true);
    mockedService.issueApiKey.mockResolvedValue("drk_new");
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.hasKey).toBe(true));
    await act(async () => {
      await result.current.handleIssue();
    });

    await act(async () => {
      await result.current.handleRevoke();
    });

    expect(window.confirm).toHaveBeenCalledWith(texts.confirmRevoke);
    expect(mockedService.revokeApiKeys).toHaveBeenCalled();
    expect(result.current.hasKey).toBe(false);
    expect(result.current.issuedKey).toBeNull();
  });

  it("コピーするとクリップボードに書き込み copied=true になる", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    mockedService.issueApiKey.mockResolvedValue("drk_new");
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.hasKey).toBe(false));
    await act(async () => {
      await result.current.handleIssue();
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith("drk_new");
    expect(result.current.copied).toBe(true);
  });
});
