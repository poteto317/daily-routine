import type { User } from "firebase/auth";

let mockIsFirebaseConfigured = false;

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
    await mod.signOutUser();

    expect(mod.getLocalAuthUser()).toBeNull();
  });
});
