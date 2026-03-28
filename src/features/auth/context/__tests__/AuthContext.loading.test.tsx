import { act, waitFor } from "@testing-library/react";
import {
  mockCheckIsAdmin,
  mockOnAuthStateChanged,
  mockEnsureAccountRecord,
  renderUseAuthHook,
  setupAuthTestDefaults,
  withMockAuthInstance,
} from "./AuthContext.test-setup";

describe("AuthContext loading", () => {
  beforeEach(() => {
    setupAuthTestDefaults();
  });

  it("認証状態確定後は管理者判定完了前でもloadingを解除する", async () => {
    withMockAuthInstance();

    let authStateCallback: ((user: unknown) => void) | undefined;
    mockOnAuthStateChanged.mockImplementation((_, callback) => {
      authStateCallback = callback as (user: unknown) => void;
      return jest.fn();
    });

    let resolveEnsure: (() => void) | undefined;
    let resolveCheck: ((value: boolean) => void) | undefined;

    mockEnsureAccountRecord.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveEnsure = resolve;
        }),
    );
    mockCheckIsAdmin.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          resolveCheck = resolve;
        }),
    );

    const { result } = renderUseAuthHook();

    expect(result.current.loading).toBe(true);

    const mockUser = {
      uid: "u1",
      email: "a@example.com",
      isAnonymous: false,
    };

    act(() => {
      authStateCallback?.(mockUser);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user?.uid).toBe("u1");

    await act(async () => {
      resolveEnsure?.();
    });

    await waitFor(() => {
      expect(mockCheckIsAdmin).toHaveBeenCalledWith("u1");
    });

    await act(async () => {
      resolveCheck?.(true);
    });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });
});
