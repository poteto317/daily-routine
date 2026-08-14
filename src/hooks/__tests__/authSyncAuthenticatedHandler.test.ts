import type { User } from "firebase/auth";
import { createAuthenticatedAuthStateHandler } from "@/hooks/authSyncAuthenticatedHandler";

const createUser = (
  overrides: Partial<Pick<User, "uid" | "email" | "isAnonymous">> = {},
): User =>
  ({
    uid: "user-1",
    email: "user@example.com",
    isAnonymous: false,
    ...overrides,
  }) as User;

describe("authSyncAuthenticatedHandler", () => {
  it("認証済みユーザーの state 適用と admin 同期を行う", async () => {
    const user = createUser();
    const setUser = jest.fn();
    const setIsAdmin = jest.fn();
    const setIsAdminLoading = jest.fn();
    const setLoading = jest.fn();
    const setCurrentUserId = jest.fn();
    const migrateToUserStorage = jest.fn();
    const ensureAccountRecord = jest.fn().mockResolvedValue(undefined);
    const checkIsAdmin = jest.fn().mockResolvedValue(false);

    const handleAuthenticatedUser = createAuthenticatedAuthStateHandler({
      setUser,
      setIsAdmin,
      setIsAdminLoading,
      setLoading,
      setCurrentUserId,
      migrateToUserStorage,
      runDateKeyMigrationOnce: jest.fn(),
      ensureAccountRecord,
      checkIsAdmin,
      isMounted: () => true,
      getCurrentUserId: () => "user-1",
    });

    handleAuthenticatedUser(user);
    await Promise.resolve();
    await Promise.resolve();

    expect(setCurrentUserId).toHaveBeenCalledWith("user-1");
    expect(migrateToUserStorage).toHaveBeenCalledWith("user-1");
    expect(setUser).toHaveBeenCalledWith(user);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setIsAdmin).toHaveBeenCalledWith(false);
    expect(setIsAdminLoading).toHaveBeenCalledWith(false);
  });
});
