import { createSyncSnapshotActionsResult } from "../syncSnapshotActionsResult";

describe("createSyncSnapshotActionsResult", () => {
  it("sync snapshot action の公開 shape を組み立てる", () => {
    const handleApply = jest.fn();
    const handleDelete = jest.fn();

    expect(
      createSyncSnapshotActionsResult({
        activeSnapshotId: "snapshot-1",
        handleApply,
        handleDelete,
      }),
    ).toEqual({
      activeSnapshotId: "snapshot-1",
      handleApply,
      handleDelete,
    });
  });
});
