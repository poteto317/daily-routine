import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SyncManagementPage } from "../SyncManagementPage";

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("../sync", () => ({
  applySyncSnapshot: jest.fn(),
  deleteSyncSnapshot: jest.fn(),
  getSyncSnapshots: jest.fn(),
}));

jest.mock("@/hooks/headerSyncReload", () => ({
  reloadAfterDownload: jest.fn(),
}));

import {
  applySyncSnapshot,
  deleteSyncSnapshot,
  getSyncSnapshots,
} from "../sync";
import { reloadAfterDownload } from "@/hooks/headerSyncReload";
import {
  mockSyncSnapshotsResponse,
  nextSyncSnapshotFixture,
  renderLoadedSyncManagementPage,
} from "./syncSnapshotUi.test.utils";

describe("SyncManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mockSyncSnapshotsResponse();
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("同期履歴一覧を表示する", async () => {
    render(<SyncManagementPage />);

    expect(screen.getByText("同期履歴を読み込み中...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("履歴 1")).toBeInTheDocument();
      expect(screen.getByText(/device-1/)).toBeInTheDocument();
    });
  });

  it("任意の同期履歴を適用できる", async () => {
    await renderLoadedSyncManagementPage();

    fireEvent.click(screen.getByText("適用"));

    await waitFor(() => {
      expect(applySyncSnapshot).toHaveBeenCalledWith("snapshot-1");
      expect(reloadAfterDownload).toHaveBeenCalled();
    });
  });

  it("任意の同期履歴を削除できる", async () => {
    await renderLoadedSyncManagementPage();

    fireEvent.click(screen.getByText("削除"));

    await waitFor(() => {
      expect(deleteSyncSnapshot).toHaveBeenCalledWith("snapshot-1");
      expect(screen.queryByText("履歴 1")).toBeNull();
    });
  });

  it("再読み込みボタンで同期履歴一覧を更新する", async () => {
    await renderLoadedSyncManagementPage();
    (getSyncSnapshots as jest.Mock).mockResolvedValueOnce([
      nextSyncSnapshotFixture,
    ]);

    fireEvent.click(screen.getByText("再読み込み"));

    await waitFor(() => {
      expect(getSyncSnapshots).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/device-2/)).toBeInTheDocument();
    });
  });
});
