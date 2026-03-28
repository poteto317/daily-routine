import { runLoginPageAction } from "../loginRuntimeActions";

describe("loginRuntimeActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("共通 login action が loading/error lifecycle を管理する", async () => {
    const setError = jest.fn();
    const setLoading = jest.fn();
    const execute = jest.fn().mockResolvedValue(undefined);

    await runLoginPageAction({
      setError,
      setLoading,
      execute,
      onError: () => "error",
    });

    expect(setError).toHaveBeenNthCalledWith(1, null);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(execute).toHaveBeenCalled();
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it("共通 login action が失敗時にエラーを設定する", async () => {
    const setError = jest.fn();
    const setLoading = jest.fn();
    const error = new Error("failed");
    const logError = jest.fn();

    await runLoginPageAction({
      setError,
      setLoading,
      execute: jest.fn().mockRejectedValue(error),
      onError: () => "login failed",
      logError,
    });

    expect(setError).toHaveBeenCalledWith("login failed");
    expect(logError).toHaveBeenCalledWith(error);
  });
});
