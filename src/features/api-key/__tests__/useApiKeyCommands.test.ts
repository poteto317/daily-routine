import { act, renderHook } from "@testing-library/react";
import * as service from "../apiKeyService";
import texts from "../locales/ja.json";
import { useApiKeyCommands } from "../useApiKeyCommands";

jest.mock("../apiKeyService");
const mockedService = jest.mocked(service);

const setup = (hasKey: boolean | null) => {
  const args = {
    hasKey,
    setHasKey: jest.fn(),
    setIssuedKey: jest.fn(),
    setError: jest.fn(),
    onIssueStart: jest.fn(),
  };
  const hook = renderHook(() => useApiKeyCommands(args));
  return { args, ...hook };
};

let confirmSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  mockedService.issueApiKey.mockResolvedValue("drk_new");
  mockedService.revokeApiKeys.mockResolvedValue(undefined);
});

afterEach(() => {
  confirmSpy.mockRestore();
});

describe("handleIssue", () => {
  it("未発行なら確認なしで発行し、キーと状態を通知する", async () => {
    const { args, result } = setup(false);
    await act(async () => {
      await result.current.handleIssue();
    });

    expect(window.confirm).not.toHaveBeenCalled();
    expect(args.onIssueStart).toHaveBeenCalledTimes(1);
    expect(args.setError).toHaveBeenCalledWith(null);
    expect(args.setIssuedKey).toHaveBeenCalledWith("drk_new");
    expect(args.setHasKey).toHaveBeenCalledWith(true);
    expect(result.current.isWorking).toBe(false);
  });

  it("発行済みなら再発行を確認し、承諾すれば発行する", async () => {
    const { args, result } = setup(true);
    await act(async () => {
      await result.current.handleIssue();
    });
    expect(window.confirm).toHaveBeenCalledWith(texts.confirmReissue);
    expect(args.setIssuedKey).toHaveBeenCalledWith("drk_new");
  });

  it("再発行の確認をキャンセルしたら何も変更しない（onIssueStart も呼ばない）", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { args, result } = setup(true);
    await act(async () => {
      await result.current.handleIssue();
    });
    expect(mockedService.issueApiKey).not.toHaveBeenCalled();
    expect(args.onIssueStart).not.toHaveBeenCalled();
    expect(args.setError).not.toHaveBeenCalled();
  });

  it("発行に失敗したらエラーを通知し、キーも状態も更新しない", async () => {
    mockedService.issueApiKey.mockRejectedValue(new Error("x"));
    const { args, result } = setup(false);
    await act(async () => {
      await result.current.handleIssue();
    });
    expect(args.setError).toHaveBeenLastCalledWith(texts.errors.issue);
    expect(args.setIssuedKey).not.toHaveBeenCalled();
    expect(args.setHasKey).not.toHaveBeenCalled();
    expect(result.current.isWorking).toBe(false);
  });

  it("確認中（hasKey が null）でも確認なしで発行を試みる", async () => {
    const { result } = setup(null);
    await act(async () => {
      await result.current.handleIssue();
    });
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

describe("handleRevoke", () => {
  it("確認後に失効し、キーの表示を消して未発行にする", async () => {
    const { args, result } = setup(true);
    await act(async () => {
      await result.current.handleRevoke();
    });
    expect(window.confirm).toHaveBeenCalledWith(texts.confirmRevoke);
    expect(mockedService.revokeApiKeys).toHaveBeenCalledTimes(1);
    expect(args.setHasKey).toHaveBeenCalledWith(false);
    expect(args.setIssuedKey).toHaveBeenCalledWith(null);
  });

  it("確認をキャンセルしたら何もしない", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { args, result } = setup(true);
    await act(async () => {
      await result.current.handleRevoke();
    });
    expect(mockedService.revokeApiKeys).not.toHaveBeenCalled();
    expect(args.setHasKey).not.toHaveBeenCalled();
  });

  it("失効に失敗したらエラーを通知し、状態は変更しない", async () => {
    mockedService.revokeApiKeys.mockRejectedValue(new Error("x"));
    const { args, result } = setup(true);
    await act(async () => {
      await result.current.handleRevoke();
    });
    expect(args.setError).toHaveBeenLastCalledWith(texts.errors.revoke);
    expect(args.setHasKey).not.toHaveBeenCalled();
    expect(args.setIssuedKey).not.toHaveBeenCalled();
    expect(result.current.isWorking).toBe(false);
  });
});
