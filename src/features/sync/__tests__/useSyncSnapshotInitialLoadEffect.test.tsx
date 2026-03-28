import { renderHook, waitFor } from "@testing-library/react";
import { useSyncSnapshotInitialLoadEffect } from "../useSyncSnapshotInitialLoadEffect";

describe("useSyncSnapshotInitialLoadEffect", () => {
  it("mount 時に loadSnapshots を実行する", async () => {
    const loadSnapshots = jest.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useSyncSnapshotInitialLoadEffect({
        loadSnapshots,
      }),
    );

    await waitFor(() => {
      expect(loadSnapshots).toHaveBeenCalledTimes(1);
    });
  });
});
