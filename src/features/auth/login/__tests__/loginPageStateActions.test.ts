import {
  createAnonymousLoginHandler,
  createLoginModeToggleHandler,
  createLoginSubmitHandler,
  createTestLoginHandler,
  runLoginPageAction,
} from "../loginPageStateActions";

jest.mock("../authErrorMessage", () => ({
  AUTH_ERROR_MESSAGES: {
    testLoginFailed: "テストログインに失敗しました",
    anonymousLoginFailed: "匿名ログインに失敗しました",
  },
  getAuthErrorMessage: jest.fn(() => "認証に失敗しました"),
}));

import { getAuthErrorMessage } from "../authErrorMessage";

describe("loginPageStateActions", () => {
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

  it("submit handler が mode に応じて signIn/signUp を呼ぶ", async () => {
    const preventDefault = jest.fn();
    const signIn = jest.fn().mockResolvedValue(undefined);
    const signUp = jest.fn().mockResolvedValue(undefined);

    await createLoginSubmitHandler({
      isSignUp: false,
      email: "user@example.com",
      password: "secret123",
      signIn,
      signUp,
      setError: jest.fn(),
      setLoading: jest.fn(),
    })({ preventDefault } as never);

    expect(preventDefault).toHaveBeenCalled();
    expect(signIn).toHaveBeenCalledWith("user@example.com", "secret123");

    await createLoginSubmitHandler({
      isSignUp: true,
      email: "user@example.com",
      password: "secret123",
      signIn,
      signUp,
      setError: jest.fn(),
      setLoading: jest.fn(),
    })({ preventDefault } as never);

    expect(signUp).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  it("submit handler が認証エラー文言を使う", async () => {
    await createLoginSubmitHandler({
      isSignUp: false,
      email: "user@example.com",
      password: "secret123",
      signIn: jest.fn().mockRejectedValue({ code: "auth/invalid-email" }),
      signUp: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn(),
    })({ preventDefault: jest.fn() } as never);

    expect(getAuthErrorMessage).toHaveBeenCalled();
  });

  it("テストログインと匿名ログイン handler が専用エラーを使う", async () => {
    const testLogError = jest.fn();
    const anonymousLogError = jest.fn();
    const setError = jest.fn();
    const setLoading = jest.fn();

    await createTestLoginHandler({
      signInAsTestUser: jest.fn().mockRejectedValue(new Error("failed")),
      setError,
      setLoading,
      logError: testLogError,
    })();

    expect(setError).toHaveBeenCalledWith("テストログインに失敗しました");
    expect(testLogError).toHaveBeenCalled();

    setError.mockClear();

    await createAnonymousLoginHandler({
      signInAnonymous: jest.fn().mockRejectedValue(new Error("failed")),
      setError,
      setLoading,
      logError: anonymousLogError,
    })();

    expect(setError).toHaveBeenCalledWith("匿名ログインに失敗しました");
    expect(anonymousLogError).toHaveBeenCalled();
  });

  it("mode toggle handler がモード反転と error clear を行う", () => {
    const setIsSignUp = jest.fn();
    const setError = jest.fn();

    createLoginModeToggleHandler({
      isSignUp: false,
      setIsSignUp,
      setError,
    })();

    expect(setIsSignUp).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(null);
  });
});
