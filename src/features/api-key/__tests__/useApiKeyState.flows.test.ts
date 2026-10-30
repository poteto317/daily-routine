import { act, renderHook, waitFor } from "@testing-library/react";
import * as service from "../apiKeyService";
import texts from "../locales/ja.json";
import { useApiKeyState } from "../useApiKeyState";

jest.mock("../apiKeyService");
const mockedService = jest.mocked(service);

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
let confirmSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockedService.hasApiKey.mockResolvedValue(true);
  mockedService.issueApiKey.mockResolvedValue("drk_new");
  confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

afterEach(() => {
  confirmSpy.mockRestore();
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    delete (navigator as { clipboard?: unknown }).clipboard;
  }
});

const loaded = async () => {
  const hook = renderHook(() => useApiKeyState());
  await waitFor(() => expect(hook.result.current.hasKey).toBe(true));
  return hook;
};

describe("useApiKeyState（フック同士の連携）", () => {
  it("再発行を承諾すると新しいキーに置き換わり、コピー済み表示は解除される", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.copied).toBe(true);

    mockedService.issueApiKey.mockResolvedValue("drk_newer");
    await act(async () => {
      await result.current.handleIssue();
    });

    expect(result.current.issuedKey).toBe("drk_newer");
    expect(result.current.copied).toBe(false);
  });

  it("再発行の確認をキャンセルすると、表示中のキーもコピー済み表示も保たれる", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    await act(async () => {
      await result.current.handleCopy();
    });
    jest.spyOn(window, "confirm").mockReturnValue(false);

    await act(async () => {
      await result.current.handleIssue();
    });

    expect(result.current.issuedKey).toBe("drk_new");
    expect(result.current.copied).toBe(true);
  });

  it("失効に失敗するとエラーが出て、キーの有無と表示中のキーは変わらない", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    mockedService.revokeApiKeys.mockRejectedValue(new Error("x"));

    await act(async () => {
      await result.current.handleRevoke();
    });

    expect(result.current.error).toBe(texts.errors.revoke);
    expect(result.current.hasKey).toBe(true);
    expect(result.current.issuedKey).toBe("drk_new");
  });

  it("コピーに失敗するとエラーが出る", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(result.current.error).toBe(texts.errors.copy);
    expect(result.current.copied).toBe(false);
  });

  it("コピー失敗後の再試行が成功すると、コピーのエラーが消えて copied になる", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: jest
          .fn()
          .mockRejectedValueOnce(new Error("denied"))
          .mockResolvedValueOnce(undefined),
      },
      configurable: true,
    });

    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.error).toBe(texts.errors.copy);
    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.handleCopy();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it("コピーに成功しても、再発行失敗のエラーは消えない（コピーのエラーだけを消す）", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    mockedService.issueApiKey.mockRejectedValue(new Error("x"));
    await act(async () => {
      await result.current.handleIssue();
    });
    expect(result.current.error).toBe(texts.errors.issue);
    expect(result.current.issuedKey).toBe("drk_new");

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBe(texts.errors.issue);
  });

  it("コピーに成功しても、失効失敗のエラーは消えない", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.handleIssue();
    });
    mockedService.revokeApiKeys.mockRejectedValue(new Error("x"));
    await act(async () => {
      await result.current.handleRevoke();
    });
    expect(result.current.error).toBe(texts.errors.revoke);
    // 失効に失敗しても、表示中のキーは残る（コピーできる前提）
    expect(result.current.issuedKey).toBe("drk_new");

    await act(async () => {
      await result.current.handleCopy();
    });

    // コピーが実際に成功したうえで、失効失敗のエラーが残る
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("drk_new");
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBe(texts.errors.revoke);
  });

  it("初回取得の失敗メッセージは、ページの再読み込みで復帰できることを案内する", async () => {
    mockedService.hasApiKey.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.error).toBe(texts.errors.load));
    expect(texts.errors.load).toContain("再読み込み");
  });

  it("初回取得の失敗エラーは、次の発行を始めると消える", async () => {
    mockedService.hasApiKey.mockRejectedValue(new Error("x"));
    const { result } = renderHook(() => useApiKeyState());
    await waitFor(() => expect(result.current.error).toBe(texts.errors.load));
    expect(result.current.hasKey).toBeNull();

    await act(async () => {
      await result.current.handleIssue();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasKey).toBe(true);
  });
});
