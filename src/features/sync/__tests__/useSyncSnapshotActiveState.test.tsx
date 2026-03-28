import { act, renderHook } from "@testing-library/react";
import { useSyncSnapshotActiveState } from "../useSyncSnapshotActiveState";

describe("useSyncSnapshotActiveState", () => {
  it("active snapshot id state を管理する", () => {
    const { result } = renderHook(() => useSyncSnapshotActiveState());

    expect(result.current.activeSnapshotId).toBeNull();

    act(() => {
      result.current.setActiveSnapshotId("snapshot-1");
    });

    expect(result.current.activeSnapshotId).toBe("snapshot-1");
  });
});
