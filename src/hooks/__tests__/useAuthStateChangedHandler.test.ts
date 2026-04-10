import { renderHook } from "@testing-library/react";
import {
  checkIsAdmin,
  ensureAccountRecord,
} from "@/features/account-admin/accountService";
import {
  getCurrentUserId,
  migrateToUserStorage,
  setCurrentUserId,
} from "@/lib/storage/core";

const mockAuthStateChangedHandler = jest.fn();

jest.mock("@/lib/storage/core", () => ({
  getCurrentUserId: jest.fn(),
  migrateToUserStorage: jest.fn(),
  setCurrentUserId: jest.fn(),
}));

jest.mock("@/features/account-admin/accountService", () => ({
  checkIsAdmin: jest.fn(),
  ensureAccountRecord: jest.fn(),
}));

jest.mock("../authSyncHandlers", () => ({
  createAuthStateChangedHandler: jest.fn(() => mockAuthStateChangedHandler),
}));

import { createAuthStateChangedHandler } from "../authSyncHandlers";
import { useAuthStateChangedHandler } from "../useAuthStateChangedHandler";

describe("useAuthStateChangedHandler", () => {
  it("認証状態変更 handler を組み立てて unmount 時の mounted 状態も反映する", () => {
    const setUser = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();
    const user = { uid: "user-1" } as never;

    const { result, unmount } = renderHook(() =>
      useAuthStateChangedHandler({
        setUser,
        setIsAdmin,
        setLoading,
        setIsAdminLoading,
      }),
    );

    result.current(user);

    expect(result.current).not.toBe(mockAuthStateChangedHandler);
    expect(createAuthStateChangedHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setUser,
        setIsAdmin,
        setLoading,
        setIsAdminLoading,
        setCurrentUserId,
        getCurrentUserId,
        migrateToUserStorage,
        ensureAccountRecord,
        checkIsAdmin,
        isMounted: expect.any(Function),
      }),
    );
    expect(mockAuthStateChangedHandler).toHaveBeenCalledWith(user);

    const isMounted = (createAuthStateChangedHandler as jest.Mock).mock
      .calls[0][0].isMounted as () => boolean;

    expect(isMounted()).toBe(true);

    unmount();

    expect(isMounted()).toBe(false);
  });
});
