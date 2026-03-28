import type { User } from "firebase/auth";
import { syncAdminStatus } from "@/hooks/authSyncAdminActions";

const createUser = (
  overrides: Partial<Pick<User, "uid" | "email" | "isAnonymous">> = {},
): User =>
  ({
    uid: "user-1",
    email: "user@example.com",
    isAnonymous: false,
    ...overrides,
  }) as User;

describe("authSyncAdminActions", () => {
  it("管理者状態を同期できる", async () => {
    const setIsAdmin = jest.fn();
    const ensureAccountRecord = jest.fn().mockResolvedValue(undefined);
    const checkIsAdmin = jest.fn().mockResolvedValue(true);

    await syncAdminStatus({
      user: createUser(),
      setIsAdmin,
      ensureAccountRecord,
      checkIsAdmin,
      isMounted: () => true,
    });

    expect(ensureAccountRecord).toHaveBeenCalledWith(
      "user-1",
      "user@example.com",
      false,
    );
    expect(checkIsAdmin).toHaveBeenCalledWith("user-1");
    expect(setIsAdmin).toHaveBeenCalledWith(true);
  });

  it("管理者同期で失敗した場合はfalseへフォールバックする", async () => {
    const setIsAdmin = jest.fn();

    await syncAdminStatus({
      user: createUser(),
      setIsAdmin,
      ensureAccountRecord: jest.fn().mockRejectedValue(new Error("fail")),
      checkIsAdmin: jest.fn(),
      isMounted: () => true,
    });

    expect(setIsAdmin).toHaveBeenCalledWith(false);
  });

  it("アンマウント後は管理者状態を更新しない", async () => {
    const setIsAdmin = jest.fn();

    await syncAdminStatus({
      user: createUser(),
      setIsAdmin,
      ensureAccountRecord: jest.fn().mockResolvedValue(undefined),
      checkIsAdmin: jest.fn().mockResolvedValue(true),
      isMounted: () => false,
    });

    expect(setIsAdmin).not.toHaveBeenCalled();
  });
});
