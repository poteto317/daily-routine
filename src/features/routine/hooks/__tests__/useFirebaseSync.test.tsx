import React from "react";
import { render, waitFor } from "@testing-library/react";
import { useFirebaseSync } from "../useFirebaseSync";
import * as firebaseLib from "@/lib/firebase";
import * as syncFeature from "@/features/sync";

jest.mock("@/lib/firebase", () => ({
  getOrCreateUser: jest.fn(),
  isFirebaseConfigured: true,
}));

jest.mock("@/features/sync", () => ({
  watchRemoteChanges: jest.fn(),
}));

const mockGetOrCreateUser = firebaseLib.getOrCreateUser as jest.MockedFunction<
  typeof firebaseLib.getOrCreateUser
>;
const mockWatchRemoteChanges =
  syncFeature.watchRemoteChanges as jest.MockedFunction<
    typeof syncFeature.watchRemoteChanges
  >;

const TestComponent = () => {
  useFirebaseSync();
  return null;
};

describe("useFirebaseSync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOrCreateUser.mockResolvedValue({ uid: "u1" } as never);
  });

  it("初回マウント時に認証確保とリモート監視を開始する", async () => {
    const unsubscribe = jest.fn();
    mockWatchRemoteChanges.mockReturnValue(unsubscribe);

    render(<TestComponent />);

    await waitFor(() => {
      expect(mockGetOrCreateUser).toHaveBeenCalledTimes(1);
      expect(mockWatchRemoteChanges).toHaveBeenCalledTimes(1);
    });
  });

  it("アンマウント時に監視解除関数を呼ぶ", () => {
    const unsubscribe = jest.fn();
    mockWatchRemoteChanges.mockReturnValue(unsubscribe);

    const { unmount } = render(<TestComponent />);
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
