import { createSyncSnapshotDataStateResult } from "../syncSnapshotDataStateResult";

describe("createSyncSnapshotDataStateResult", () => {
  it("snapshot data state の公開 shape を返す", () => {
    const loadSnapshots = jest.fn(async () => {});
    const setSnapshots = jest.fn();
    const snapshots = [{ id: "snapshot-1" } as never];

    expect(
      createSyncSnapshotDataStateResult({
        error: null,
        isLoading: true,
        loadSnapshots,
        setSnapshots,
        snapshots,
      }),
    ).toEqual({
      error: null,
      isLoading: true,
      loadSnapshots,
      setSnapshots,
      snapshots,
    });
  });
});
