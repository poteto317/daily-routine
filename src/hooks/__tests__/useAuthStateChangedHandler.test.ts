import { syncRoutinesToFirebase } from "@/features/routine/helpersSync";
import { getNotificationBootstrapRoutines } from "@/features/routine/storageRoutinesCore";
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

jest.mock("@/features/routine/helpersSync", () => ({
  syncRoutinesToFirebase: jest.fn().mockResolvedValue(true),
}));
jest.mock("@/features/routine/storageRoutinesCore", () => ({
  getNotificationBootstrapRoutines: jest.fn(),
}));

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

  it("通知再登録では既存値を移行前に読み取り、認証反映後に送る", () => {
    const previous = process.env.NEXT_PUBLIC_FUNCTIONS_URL;
    const endpoint = "https://functions.example.com";
    process.env.NEXT_PUBLIC_FUNCTIONS_URL = endpoint;
    try {
      jest.clearAllMocks();
      jest
        .mocked(getNotificationBootstrapRoutines)
        .mockReturnValueOnce([])
        .mockReturnValueOnce(null);
      const { result } = renderHook(() =>
        useAuthStateChangedHandler({
          setUser: jest.fn(),
          setIsAdmin: jest.fn(),
          setLoading: jest.fn(),
          setIsAdminLoading: jest.fn(),
        }),
      );
      result.current({ uid: "owner" } as never);
      result.current({ uid: "other" } as never);
      expect(getNotificationBootstrapRoutines).toHaveBeenNthCalledWith(
        1,
        "owner",
      );
      const [readOrder] = jest.mocked(getNotificationBootstrapRoutines).mock
        .invocationCallOrder;
      const [authOrder] = mockAuthStateChangedHandler.mock.invocationCallOrder;
      const [sendOrder] = jest.mocked(syncRoutinesToFirebase).mock
        .invocationCallOrder;
      expect(readOrder).toBeLessThan(authOrder);
      expect(authOrder).toBeLessThan(sendOrder);
      expect(syncRoutinesToFirebase).toHaveBeenCalledTimes(1);
      expect(syncRoutinesToFirebase).toHaveBeenCalledWith(
        [],
        endpoint,
        "owner",
      );
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_FUNCTIONS_URL;
      else process.env.NEXT_PUBLIC_FUNCTIONS_URL = previous;
    }
  });
});
