import {
  downloadFromFirestore,
  getSyncStatus,
  refreshRemoteSyncStatus,
  refreshSyncStatusFromStoredRemote,
  uploadToFirestore,
} from "@/features/sync";

jest.mock("@/features/sync", () => ({
  ...jest.requireActual("@/features/sync"),
  downloadFromFirestore: jest.fn(),
  getSyncStatus: jest.fn(),
  refreshRemoteSyncStatus: jest.fn(),
  refreshSyncStatusFromStoredRemote: jest.fn(),
  uploadToFirestore: jest.fn(),
}));

export const mockGetSyncStatus = getSyncStatus as jest.MockedFunction<
  typeof getSyncStatus
>;

export const mockUploadToFirestore = uploadToFirestore as jest.MockedFunction<
  typeof uploadToFirestore
>;

export const mockRefreshRemoteSyncStatus =
  refreshRemoteSyncStatus as jest.MockedFunction<
    typeof refreshRemoteSyncStatus
  >;

export const mockRefreshSyncStatusFromStoredRemote =
  refreshSyncStatusFromStoredRemote as jest.MockedFunction<
    typeof refreshSyncStatusFromStoredRemote
  >;

export const mockDownloadFromFirestore =
  downloadFromFirestore as jest.MockedFunction<typeof downloadFromFirestore>;

export const setupHeaderHooksMocks = () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();

  mockGetSyncStatus.mockReturnValue({
    isSyncing: false,
    lastSyncTime: null,
    localLastModified: null,
    remoteLastModified: null,
    hasRemoteChanges: false,
    hasLocalChanges: false,
    error: null,
  });
  mockRefreshRemoteSyncStatus.mockResolvedValue(undefined);
};
