import { render, screen, waitFor } from "@testing-library/react";
import { SyncManagementPage } from "../SyncManagementPage";
import { getSyncSnapshots, type SyncSnapshot } from "../sync";
import { createSyncSnapshotFixture } from "./sync.test.fixtures";

export const defaultSyncSnapshotFixture = createSyncSnapshotFixture();

export const nextSyncSnapshotFixture = createSyncSnapshotFixture({
  id: "snapshot-2",
  uploadedAt: Date.parse("2026-03-11T10:00:00.000Z"),
  deviceId: "device-2",
});

export const mockSyncSnapshotsResponse = (
  snapshots: SyncSnapshot[] = [defaultSyncSnapshotFixture],
): void => {
  (getSyncSnapshots as jest.Mock).mockResolvedValue(snapshots);
};

export const waitForLoadedSyncState = async (result: {
  current: { isLoading: boolean };
}): Promise<void> => {
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
};

export const renderLoadedSyncManagementPage = async (): Promise<void> => {
  render(<SyncManagementPage />);

  await waitFor(() => {
    expect(screen.getByText("適用")).toBeInTheDocument();
  });
};
