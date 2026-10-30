import { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "../authErrorMessage";

describe("authErrorMessage", () => {
  it("AUTH_ERROR_MESSAGES 定数が定義されている", () => {
    expect(AUTH_ERROR_MESSAGES).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.invalidEmail).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.invalidCredential).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.emailAlreadyInUse).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.weakPassword).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.networkError).toBeDefined();
    expect(AUTH_ERROR_MESSAGES.authFailed).toBeDefined();
  });

  describe("getAuthErrorMessage", () => {
    it("auth/invalid-email の場合は invalidEmail メッセージを返す", () => {
      const error = { code: "auth/invalid-email" };
      expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.invalidEmail);
    });

    it("auth/user-not-found の場合は invalidCredential メッセージを返す", () => {
      const error = { code: "auth/user-not-found" };
      expect(getAuthErrorMessage(error)).toBe(
        AUTH_ERROR_MESSAGES.invalidCredential,
      );
    });

    it("auth/wrong-password の場合は invalidCredential メッセージを返す", () => {
      const error = { code: "auth/wrong-password" };
      expect(getAuthErrorMessage(error)).toBe(
        AUTH_ERROR_MESSAGES.invalidCredential,
      );
    });

    it("auth/invalid-credential の場合は invalidCredential メッセージを返す", () => {
      const error = { code: "auth/invalid-credential" };
      expect(getAuthErrorMessage(error)).toBe(
        AUTH_ERROR_MESSAGES.invalidCredential,
      );
    });

    it("auth/email-already-in-use の場合は emailAlreadyInUse メッセージを返す", () => {
      const error = { code: "auth/email-already-in-use" };
      expect(getAuthErrorMessage(error)).toBe(
        AUTH_ERROR_MESSAGES.emailAlreadyInUse,
      );
    });

    it("auth/weak-password の場合は weakPassword メッセージを返す", () => {
      const error = { code: "auth/weak-password" };
      expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.weakPassword);
    });

    it("code に network が含まれる場合は networkError メッセージを返す", () => {
      const error = { code: "auth/network-request-failed" };
      expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.networkError);
    });

    it("未定義のエラーコードの場合はデフォルトの authFailed メッセージを返す", () => {
      const error = { code: "auth/unknown-error" };
      expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.authFailed);
    });

    it("null や非オブジェクトが渡された場合は authFailed メッセージを返す", () => {
      expect(getAuthErrorMessage(null)).toBe(AUTH_ERROR_MESSAGES.authFailed);
      expect(getAuthErrorMessage(undefined)).toBe(
        AUTH_ERROR_MESSAGES.authFailed,
      );
      expect(getAuthErrorMessage("some error string")).toBe(
        AUTH_ERROR_MESSAGES.authFailed,
      );
      expect(getAuthErrorMessage(123)).toBe(AUTH_ERROR_MESSAGES.authFailed);
      expect(getAuthErrorMessage({})).toBe(AUTH_ERROR_MESSAGES.authFailed);
    });
  });
});
