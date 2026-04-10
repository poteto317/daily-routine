import { act, renderHook } from "@testing-library/react";
import { getAuthInstance } from "@/lib/firebase";
import { subscribeLocalAuthUser } from "@/services/authService";
import { onAuthStateChanged, type Auth, type User } from "firebase/auth";

let mockIsFirebaseConfigured = true;
let mockIsLocalAuthEnabled = false;

jest.mock("@/features/auth/storage", () => ({
  get isLocalAuthEnabled() {
    return mockIsLocalAuthEnabled;
  },
}));

jest.mock("@/lib/firebase", () => ({
  getAuthInstance: jest.fn(),
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

jest.mock("@/services/authService", () => ({
  subscribeLocalAuthUser: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

import { useAuthSyncSubscription } from "../useAuthSyncSubscription";

const mockGetAuthInstance = getAuthInstance as jest.MockedFunction<
  typeof getAuthInstance
>;
const mockSubscribeLocalAuthUser =
  subscribeLocalAuthUser as jest.MockedFunction<typeof subscribeLocalAuthUser>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;

describe("useAuthSyncSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsFirebaseConfigured = true;
    mockIsLocalAuthEnabled = false;
    mockSubscribeLocalAuthUser.mockReturnValue(jest.fn());
    mockOnAuthStateChanged.mockImplementation(
      () => jest.fn() as ReturnType<typeof onAuthStateChanged>,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("auth listener を購読して unmount 時に解除する", () => {
    const auth = {} as Auth;
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();
    const unsubscribe = jest.fn();

    mockGetAuthInstance.mockReturnValue(auth);
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() =>
      useAuthSyncSubscription({
        handleAuthStateChanged,
        setLoading,
        setIsAdminLoading,
      }),
    );

    expect(mockGetAuthInstance).toHaveBeenCalled();
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(
      auth,
      handleAuthStateChanged,
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("Firebase 未設定時は local auth を購読する", () => {
    mockIsFirebaseConfigured = false;
    mockIsLocalAuthEnabled = true;
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();
    const unsubscribe = jest.fn();

    mockSubscribeLocalAuthUser.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() =>
      useAuthSyncSubscription({
        handleAuthStateChanged,
        setLoading,
        setIsAdminLoading,
      }),
    );

    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
    expect(mockSubscribeLocalAuthUser).toHaveBeenCalledWith(
      handleAuthStateChanged,
    );
    expect(setLoading).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("Firebase 未設定かつ local auth 無効時は loading と isAdminLoading を解除する", () => {
    mockIsFirebaseConfigured = false;
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();

    renderHook(() =>
      useAuthSyncSubscription({
        handleAuthStateChanged,
        setLoading,
        setIsAdminLoading,
      }),
    );

    expect(mockSubscribeLocalAuthUser).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setIsAdminLoading).toHaveBeenCalledWith(false);
  });

  it("auth instance の取得失敗時も loading と isAdminLoading を解除する", () => {
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();
    const setIsAdminLoading = jest.fn();

    mockGetAuthInstance.mockImplementation(() => {
      throw new Error("failed");
    });

    renderHook(() =>
      useAuthSyncSubscription({
        handleAuthStateChanged,
        setLoading,
        setIsAdminLoading,
      }),
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setIsAdminLoading).toHaveBeenCalledWith(false);
  });
});
