import type { User } from "firebase/auth";

jest.mock("../authSyncAuthenticatedHandler", () => ({
  createAuthenticatedAuthStateHandler: jest.fn(),
}));

jest.mock("../authSyncSignedOutHandler", () => ({
  createSignedOutAuthStateHandler: jest.fn(),
}));

import { createAuthStateChangedHandler } from "@/hooks/authSyncHandlers";
import { createAuthenticatedAuthStateHandler } from "../authSyncAuthenticatedHandler";
import { createSignedOutAuthStateHandler } from "../authSyncSignedOutHandler";

const createUser = (
  overrides: Partial<Pick<User, "uid" | "email" | "isAnonymous">> = {},
): User =>
  ({
    uid: "user-1",
    email: "user@example.com",
    isAnonymous: false,
    ...overrides,
  }) as User;

describe("authSyncHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("状態変更ハンドラは認証済みユーザーで管理者同期を開始する", async () => {
    const user = createUser();
    const handleAuthenticatedUser = jest.fn();
    const handleSignedOutUser = jest.fn();

    (createAuthenticatedAuthStateHandler as jest.Mock).mockReturnValue(
      handleAuthenticatedUser,
    );
    (createSignedOutAuthStateHandler as jest.Mock).mockReturnValue(
      handleSignedOutUser,
    );

    const handleAuthStateChanged = createAuthStateChangedHandler({
      setUser: jest.fn(),
      setIsAdmin: jest.fn(),
      setIsAdminLoading: jest.fn(),
      setLoading: jest.fn(),
      setCurrentUserId: jest.fn(),
      getCurrentUserId: jest.fn(),
      migrateToUserStorage: jest.fn(),
      runDateKeyMigrationOnce: jest.fn(),
      ensureAccountRecord: jest.fn(),
      checkIsAdmin: jest.fn(),
      isMounted: () => true,
    });

    handleAuthStateChanged(user);

    expect(handleAuthenticatedUser).toHaveBeenCalledWith(user);
    expect(handleSignedOutUser).not.toHaveBeenCalled();
  });

  it("状態変更ハンドラは未認証ユーザーをリセットする", () => {
    const handleAuthenticatedUser = jest.fn();
    const handleSignedOutUser = jest.fn();

    (createAuthenticatedAuthStateHandler as jest.Mock).mockReturnValue(
      handleAuthenticatedUser,
    );
    (createSignedOutAuthStateHandler as jest.Mock).mockReturnValue(
      handleSignedOutUser,
    );

    const handleAuthStateChanged = createAuthStateChangedHandler({
      setUser: jest.fn(),
      setIsAdmin: jest.fn(),
      setIsAdminLoading: jest.fn(),
      setLoading: jest.fn(),
      setCurrentUserId: jest.fn(),
      getCurrentUserId: jest.fn(),
      migrateToUserStorage: jest.fn(),
      runDateKeyMigrationOnce: jest.fn(),
      ensureAccountRecord: jest.fn(),
      checkIsAdmin: jest.fn(),
      isMounted: () => true,
    });

    handleAuthStateChanged(null);

    expect(handleAuthenticatedUser).not.toHaveBeenCalled();
    expect(handleSignedOutUser).toHaveBeenCalledWith();
  });
});
