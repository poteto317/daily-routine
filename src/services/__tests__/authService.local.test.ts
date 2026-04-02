import type { User } from "firebase/auth";
import { setCurrentUserId } from "@/lib/storage/core";

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

  it("ローカル認証が無効なら Firebase 未設定時のメールログインは失敗する", async () => {
    process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH = "false";
    const mod = await import("../authService");

    await expect(
      mod.signInWithEmail("local@example.com", "password123"),
    ).rejects.toThrow();
  });
});
