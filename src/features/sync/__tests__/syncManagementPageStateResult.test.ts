import type { SyncSnapshot } from "../sync";
import { createSyncManagementPageStateResult } from "../syncManagementPageStateResult";
import { createSyncSnapshotFixture } from "./sync.test.fixtures";

const createSyncManagementPageStateResultArgsFixture = () => ({
  activeSnapshotId: "snapshot-1",
  error: null,
  isLoading: false,
  loadSnapshots: jest.fn(),
  snapshots: [createSyncSnapshotFixture()] as SyncSnapshot[],
  handleApply: jest.fn(),
  handleDelete: jest.fn(),
});

describe("syncManagementPageStateResult", () => {
  it("sync management page の公開 state を組み立てる", () => {
    const args = createSyncManagementPageStateResultArgsFixture();

    expect(createSyncManagementPageStateResult(args)).toEqual(args);
  });
});
