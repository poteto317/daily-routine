import { render } from "@testing-library/react";
import { Header } from "../Header";
import type { HeaderProps } from "../Header";
import { AuthProvider } from "@/features/auth";
import { downloadFromFirestore, uploadToFirestore } from "@/features/sync";

jest.mock("@/hooks/headerSyncReload", () => ({
  reloadAfterDownload: jest.fn(),
}));

jest.mock("@/features/sync", () => ({
  ...jest.requireActual("@/features/sync"),
  downloadFromFirestore: jest.fn(),
  getSyncStatus: jest.fn(() => ({
    isSyncing: false,
    lastSyncTime: null,
    localLastModified: null,
    remoteLastModified: null,
    hasRemoteChanges: false,
    hasLocalChanges: false,
    error: null,
  })),
  refreshRemoteSyncStatus: jest.fn(),
  uploadToFirestore: jest.fn(),
}));

export const mockUploadToFirestore = uploadToFirestore as jest.MockedFunction<
  typeof uploadToFirestore
>;
export const mockDownloadFromFirestore =
  downloadFromFirestore as jest.MockedFunction<typeof downloadFromFirestore>;

export const mockOnNavigateAction = jest.fn();
export const mockOnToggleEditModeAction = jest.fn();

const defaultProps: HeaderProps = {
  onNavigateAction: mockOnNavigateAction,
  currentPage: "home",
  isEditMode: true,
  onToggleEditModeAction: mockOnToggleEditModeAction,
};

export const setupHeaderTestDefaults = () => {
  jest.clearAllMocks();
  jest.spyOn(window, "alert").mockImplementation(() => undefined);
  jest.spyOn(window, "confirm").mockImplementation(() => true);
  mockUploadToFirestore.mockResolvedValue(undefined);
  mockDownloadFromFirestore.mockResolvedValue(undefined);
};

export const cleanupHeaderTestDefaults = () => {
  (window.alert as jest.Mock).mockRestore();
  (window.confirm as jest.Mock).mockRestore();
};

export const renderHeader = (props?: Partial<HeaderProps>) => {
  return render(
    <AuthProvider>
      <Header {...defaultProps} {...props} />
    </AuthProvider>,
  );
};
