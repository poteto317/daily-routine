import {
  createAnonymousLoginHandler,
  createLoginSubmitHandler,
  createTestLoginHandler,
} from "../loginAuthHandlers";

jest.mock("../authErrorMessage", () => ({
  AUTH_ERROR_MESSAGES: {
    testLoginFailed: "テストログインに失敗しました",
    anonymousLoginFailed: "匿名ログインに失敗しました",
  },
  getAuthErrorMessage: jest.fn(() => "認証に失敗しました"),
}));

jest.mock("../loginRuntimeActions", () => ({
  runLoginPageAction: jest.fn(() => Promise.resolve()),
}));

import { getAuthErrorMessage } from "../authErrorMessage";
import { runLoginPageAction } from "../loginRuntimeActions";

describe("loginAuthHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submit handler が mode に応じて signIn/signUp を組み立てる", async () => {
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
    const signInArgs = (runLoginPageAction as jest.Mock).mock.calls[0][0];
    await signInArgs.execute();
    expect(signIn).toHaveBeenCalledWith("user@example.com", "secret123");
    expect(signInArgs.onError).toBe(getAuthErrorMessage);

    await createLoginSubmitHandler({
      isSignUp: true,
      email: "user@example.com",
      password: "secret123",
      signIn,
      signUp,
      setError: jest.fn(),
      setLoading: jest.fn(),
    })({ preventDefault } as never);

    const signUpArgs = (runLoginPageAction as jest.Mock).mock.calls[1][0];
    await signUpArgs.execute();
    expect(signUp).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  it("テストログインと匿名ログイン handler が専用エラーを使う", async () => {
    const testLogError = jest.fn();
    const anonymousLogError = jest.fn();

    await createTestLoginHandler({
      signInAsTestUser: jest.fn().mockResolvedValue(undefined),
      setError: jest.fn(),
      setLoading: jest.fn(),
      logError: testLogError,
    })();

    const testArgs = (runLoginPageAction as jest.Mock).mock.calls[0][0];
    expect(testArgs.onError()).toBe("テストログインに失敗しました");
    expect(testArgs.logError).toBe(testLogError);

    await createAnonymousLoginHandler({
      signInAnonymous: jest.fn().mockResolvedValue(undefined),
      setError: jest.fn(),
      setLoading: jest.fn(),
      logError: anonymousLogError,
    })();

    const anonymousArgs = (runLoginPageAction as jest.Mock).mock.calls[1][0];
    expect(anonymousArgs.onError()).toBe("匿名ログインに失敗しました");
    expect(anonymousArgs.logError).toBe(anonymousLogError);
  });
});
