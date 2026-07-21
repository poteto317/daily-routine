import { createSyncSnapshotDataStateResult } from "../syncSnapshotDataStateResult";
import { createSyncSnapshotFixture } from "./sync.test.fixtures";

const createSyncSnapshotDataStateResultArgsFixture = () => ({
  error: null,
  isLoading: true,
  loadSnapshots: jest.fn(async () => {}),
  setSnapshots: jest.fn(),
  snapshots: [createSyncSnapshotFixture()],
});

describe("createSyncSnapshotDataStateResult", () => {
  it("snapshot data state の公開 shape を返す", () => {
    const args = createSyncSnapshotDataStateResultArgsFixture();

    expect(createSyncSnapshotDataStateResult(args)).toEqual(args);
  });
});
