import { act, renderHook } from "@testing-library/react";
import { getAuthInstance } from "@/lib/firebase";
import { subscribeLocalAuthUser } from "@/services/authService";
import { onAuthStateChanged, type Auth, type User } from "firebase/auth";

let mockIsFirebaseConfigured = true;

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
    const unsubscribe = jest.fn();

    mockGetAuthInstance.mockReturnValue(auth);
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() =>
      useAuthSyncSubscription({ handleAuthStateChanged, setLoading }),
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
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();
    const unsubscribe = jest.fn();

    mockSubscribeLocalAuthUser.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() =>
      useAuthSyncSubscription({ handleAuthStateChanged, setLoading }),
    );

    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
    expect(mockSubscribeLocalAuthUser).toHaveBeenCalledWith(
      handleAuthStateChanged,
    );
    expect(setLoading).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("auth instance の取得失敗時も loading を解除する", () => {
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();

    mockGetAuthInstance.mockImplementation(() => {
      throw new Error("failed");
    });

    renderHook(() =>
      useAuthSyncSubscription({ handleAuthStateChanged, setLoading }),
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(setLoading).toHaveBeenCalledWith(false);
  });
});
