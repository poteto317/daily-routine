import type { User } from "firebase/auth";
import {
  applyAuthenticatedUserState,
  applySignedOutUserState,
} from "@/hooks/authSyncStateActions";

const createUser = (
  overrides: Partial<Pick<User, "uid" | "email" | "isAnonymous">> = {},
): User =>
  ({
    uid: "user-1",
    email: "user@example.com",
    isAnonymous: false,
    ...overrides,
  }) as User;

describe("authSyncStateActions", () => {
  it("認証済みユーザー状態を反映する", () => {
    const user = createUser();
    const setUser = jest.fn();
    const setLoading = jest.fn();
    const setCurrentUserId = jest.fn();
    const migrateToUserStorage = jest.fn();
    const runDateKeyMigrationOnce = jest.fn();

    applyAuthenticatedUserState(
      user,
      { setUser, setLoading },
      { setCurrentUserId, migrateToUserStorage, runDateKeyMigrationOnce },
    );

    expect(setCurrentUserId).toHaveBeenCalledWith("user-1");
    expect(migrateToUserStorage).toHaveBeenCalledWith("user-1");
    expect(runDateKeyMigrationOnce).toHaveBeenCalledWith("user-1");
    expect(setUser).toHaveBeenCalledWith(user);
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("ユーザースコープを確定させてから日付キーを移行する", () => {
    // 先に移行すると、まだスコープ外のキーを読んでしまい何も移せない
    const order: string[] = [];
    applyAuthenticatedUserState(
      createUser(),
      { setUser: jest.fn(), setLoading: jest.fn() },
      {
        setCurrentUserId: () => order.push("setCurrentUserId"),
        migrateToUserStorage: () => order.push("migrateToUserStorage"),
        runDateKeyMigrationOnce: () => order.push("runDateKeyMigrationOnce"),
      },
    );

    expect(order).toEqual([
      "setCurrentUserId",
      "migrateToUserStorage",
      "runDateKeyMigrationOnce",
    ]);
  });

  it("サインアウト状態を反映する", () => {
    const setUser = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();
    const setCurrentUserId = jest.fn();

    applySignedOutUserState(
      { setUser, setIsAdmin, setLoading, setIsAdminLoading },
      setCurrentUserId,
    );

    expect(setCurrentUserId).toHaveBeenCalledWith(null);
    expect(setIsAdmin).toHaveBeenCalledWith(false);
    expect(setUser).toHaveBeenCalledWith(null);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setIsAdminLoading).toHaveBeenCalledWith(false);
  });
});
