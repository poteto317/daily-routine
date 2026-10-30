import type { User } from "firebase/auth";
import { setCurrentUserId } from "@/lib/storage/core";
import texts from "../locales/ja.json";

let mockIsFirebaseConfigured = false;
const previousLocalAuthEnv = process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH;

jest.mock("@/lib/firebase", () => ({
  getAuthInstance: jest.fn(),
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

describe("authService local fallback", () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    mockIsFirebaseConfigured = false;
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "true";
  });

  afterAll(() => {
    if (previousLocalAuthEnv === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH;
      return;
    }

    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = previousLocalAuthEnv;
  });

  it("Firebase 未設定時でもメールログインでローカルユーザーを作れる", async () => {
    const mod = await import("../authService");

    await mod.signInWithEmail("local@example.com", "password123");

    const user = mod.getLocalAuthUser() as User;
    expect(user.uid).toContain("local-user-local-example-com");
    expect(user.email).toBe("local@example.com");
    expect(user.isAnonymous).toBe(false);
  });

  it("Firebase 未設定時でも匿名ログインできる", async () => {
    const mod = await import("../authService");

    await mod.signInAnonymousUser();

    const user = mod.getLocalAuthUser() as User;
    expect(user.uid).toBe("local-anonymous");
    expect(user.email).toBeNull();
    expect(user.isAnonymous).toBe(true);
  });

  it("Firebase 未設定時でもテストアカウントログインできる", async () => {
    const mod = await import("../authService");

    await mod.signInAsTestUser();

    const user = mod.getLocalAuthUser() as User;
    expect(user.email).toBe("test@example.com");
    expect(user.isAnonymous).toBe(false);
  });

  it("ログアウトでローカルユーザーをクリアする", async () => {
    const mod = await import("../authService");

    await mod.signInWithEmail("local@example.com", "password123");
    setCurrentUserId("local-user-local-example-com");
    await mod.signOutUser();

    expect(mod.getLocalAuthUser()).toBeNull();
    expect(localStorage.getItem("local-dev-auth-user")).toBeNull();
  });

  it("Firebase 未設定時でもメールサインアップでローカルユーザーを作れる", async () => {
    const mod = await import("../authService");

    await mod.signUpWithEmail("signup@example.com", "password123");

    const user = mod.getLocalAuthUser() as User;
    expect(user.uid).toContain("local-user-signup-example-com");
    expect(user.email).toBe("signup@example.com");
    expect(user.isAnonymous).toBe(false);
  });

  it("ローカル認証が無効なら Firebase 未設定時のメールログインは失敗する", async () => {
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "false";
    const mod = await import("../authService");

    await expect(
      mod.signInWithEmail("local@example.com", "password123"),
    ).rejects.toThrow();
  });

  it("ローカル認証が無効なら、メール系は Firebase 未設定、匿名・テストアカウントはクラウド未設定の文言で失敗する", async () => {
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "false";
    const mod = await import("../authService");

    await expect(
      mod.signInWithEmail("local@example.com", "password123"),
    ).rejects.toThrow(texts.authService.firebaseNotConfigured);
    await expect(
      mod.signUpWithEmail("local@example.com", "password123"),
    ).rejects.toThrow(texts.authService.firebaseNotConfigured);
    await expect(mod.signInAnonymousUser()).rejects.toThrow(
      texts.authService.cloudNotConfigured,
    );
    await expect(mod.signInAsTestUser()).rejects.toThrow(
      texts.authService.cloudNotConfigured,
    );
    expect(mod.getLocalAuthUser()).toBeNull();
  });

  it("ローカルユーザーの uid はメールアドレスを小文字にし、英数字以外の連続をハイフン 1 つにして前後のハイフンを除く", async () => {
    const mod = await import("../authService");

    await mod.signInWithEmail("  Foo.Bar+x@Example.COM ", "password123");

    const user = mod.getLocalAuthUser() as User;
    expect(user.uid).toBe("local-user-foo-bar-x-example-com");
    // メールアドレス自体は入力のまま保存する
    expect(user.email).toBe("  Foo.Bar+x@Example.COM ");
  });

  it("メールアドレスが空なら uid は local-user になる", async () => {
    const mod = await import("../authService");

    await mod.signUpWithEmail("", "password123");

    expect((mod.getLocalAuthUser() as User).uid).toBe("local-user");
  });

  it("subscribeLocalAuthUser は現在の状態をすぐ通知し、ログイン・ログアウトのたびに通知する", async () => {
    const mod = await import("../authService");
    const listener = jest.fn();

    const unsubscribe = mod.subscribeLocalAuthUser(listener);
    await mod.signInAnonymousUser();
    await mod.signOutUser();
    unsubscribe();
    await mod.signInAnonymousUser();

    expect(listener.mock.calls.map(([user]) => user?.uid ?? null)).toEqual([
      null,
      "local-anonymous",
      null,
    ]);
  });

  it("ログアウトで現在のユーザー ID も解除する", async () => {
    const mod = await import("../authService");
    const core = await import("@/lib/storage/core");

    await mod.signInAnonymousUser();
    core.setCurrentUserId("local-anonymous");
    await mod.signOutUser();

    expect(core.getCurrentUserId()).toBeNull();
  });
});
