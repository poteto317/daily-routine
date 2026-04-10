import { renderHook } from "@testing-library/react";
import type { User } from "firebase/auth";

const mockHandleAuthStateChanged = jest.fn();

jest.mock("../useAuthStateChangedHandler", () => ({
  useAuthStateChangedHandler: jest.fn(() => mockHandleAuthStateChanged),
}));

jest.mock("../useAuthSyncSubscription", () => ({
  useAuthSyncSubscription: jest.fn(),
}));

import { useAuthStateChangedHandler } from "../useAuthStateChangedHandler";
import { useAuthSyncSubscription } from "../useAuthSyncSubscription";
import { useAuthSync } from "../useAuthSync";

describe("useAuthSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("state changed handler と subscription hook を compose する", () => {
    const setUser = jest.fn() as React.Dispatch<
      React.SetStateAction<User | null>
    >;
    const setIsAdmin = jest.fn() as React.Dispatch<
      React.SetStateAction<boolean>
    >;
    const setLoading = jest.fn() as React.Dispatch<
      React.SetStateAction<boolean>
    >;
    const setIsAdminLoading = jest.fn() as React.Dispatch<
      React.SetStateAction<boolean>
    >;

    renderHook(() =>
      useAuthSync({ setUser, setIsAdmin, setLoading, setIsAdminLoading }),
    );

    expect(useAuthStateChangedHandler).toHaveBeenCalledWith({
      setUser,
      setIsAdmin,
      setLoading,
      setIsAdminLoading,
    });
    expect(useAuthSyncSubscription).toHaveBeenCalledWith({
      handleAuthStateChanged: mockHandleAuthStateChanged,
      setLoading,
      setIsAdminLoading,
    });
  });
});
