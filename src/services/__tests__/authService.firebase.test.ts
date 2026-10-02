import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInAnonymously: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  getAuthInstance: jest.fn(() => ({})),
  isFirebaseConfigured: true,
}));

describe("authService firebase integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Firebase経由でメールログインできる", async () => {
    const mod = await import("../authService");
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    await mod.signInWithEmail("user@example.com", "pass1234");
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "user@example.com",
      "pass1234",
    );
  });

  it("Firebase経由でサインアップできる", async () => {
    const mod = await import("../authService");
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    await mod.signUpWithEmail("new@example.com", "pass1234");
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "new@example.com",
      "pass1234",
    );
  });

  it("Firebase経由でログアウトできる", async () => {
    const mod = await import("../authService");
    (firebaseSignOut as jest.Mock).mockResolvedValueOnce(undefined);

    await mod.signOutUser();
    expect(firebaseSignOut).toHaveBeenCalled();
  });

  it("Firebase経由で匿名ログインできる", async () => {
    const mod = await import("../authService");
    (signInAnonymously as jest.Mock).mockResolvedValueOnce({});

    await mod.signInAnonymousUser();
    expect(signInAnonymously).toHaveBeenCalled();
  });

  it("テストユーザーでログイン成功する", async () => {
    const mod = await import("../authService");
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    await mod.signInAsTestUser();
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it("テストユーザーが存在しない（auth/user-not-found）場合は自動でサインアップする", async () => {
    const mod = await import("../authService");
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/user-not-found",
    });
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    await mod.signInAsTestUser();
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it("テストユーザーの認証情報が無効（auth/invalid-credential）の場合は自動でサインアップする", async () => {
    const mod = await import("../authService");
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/invalid-credential",
    });
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

    await mod.signInAsTestUser();
    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it("テストユーザーログインで予期せぬエラーが起きた場合はそのまま throw する", async () => {
    const mod = await import("../authService");
    const unexpectedError = new Error("Network error");
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      unexpectedError,
    );

    await expect(mod.signInAsTestUser()).rejects.toThrow("Network error");
  });

  it("subscribeLocalAuthUser でスナップショット変更を購読できる", async () => {
    const mod = await import("../authService");
    const listener = jest.fn();
    const unsubscribe = mod.subscribeLocalAuthUser(listener);
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });
});
