import { act, renderHook } from "@testing-library/react";
import { getAuthInstance } from "@/lib/firebase";
import { onAuthStateChanged, type Auth, type User } from "firebase/auth";

let mockIsFirebaseConfigured = true;

jest.mock("@/lib/firebase", () => ({
  getAuthInstance: jest.fn(),
  get isFirebaseConfigured() {
    return mockIsFirebaseConfigured;
  },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

import { useAuthSyncSubscription } from "../useAuthSyncSubscription";

const mockGetAuthInstance = getAuthInstance as jest.MockedFunction<
  typeof getAuthInstance
>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;

describe("useAuthSyncSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsFirebaseConfigured = true;
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

  it("Firebase 未設定時は loading を解除して listener を貼らない", () => {
    mockIsFirebaseConfigured = false;
    const handleAuthStateChanged = jest.fn<void, [User | null]>();
    const setLoading = jest.fn();

    renderHook(() =>
      useAuthSyncSubscription({ handleAuthStateChanged, setLoading }),
    );

    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(setLoading).toHaveBeenCalledWith(false);
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
