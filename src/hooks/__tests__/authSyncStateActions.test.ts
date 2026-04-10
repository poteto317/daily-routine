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

    applyAuthenticatedUserState(
      user,
      { setUser, setLoading },
      { setCurrentUserId, migrateToUserStorage },
    );

    expect(setCurrentUserId).toHaveBeenCalledWith("user-1");
    expect(migrateToUserStorage).toHaveBeenCalledWith("user-1");
    expect(setUser).toHaveBeenCalledWith(user);
    expect(setLoading).toHaveBeenCalledWith(false);
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
