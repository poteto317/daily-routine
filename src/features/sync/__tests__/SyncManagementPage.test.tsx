import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SyncManagementPage } from "../SyncManagementPage";

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../sync", () => ({
  applySyncSnapshot: jest.fn(),
  deleteSyncSnapshot: jest.fn(),
  getSyncSnapshots: jest.fn(),
}));

jest.mock("@/hooks/headerSyncReload", () => ({
  reloadAfterDownload: jest.fn(),
}));

import { applySyncSnapshot, deleteSyncSnapshot, getSyncSnapshots } from "../sync";
import { reloadAfterDownload } from "@/hooks/headerSyncReload";

describe("SyncManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (getSyncSnapshots as jest.Mock).mockResolvedValue([
      {
        id: "snapshot-1",
        uploadedAt: Date.parse("2026-03-10T10:00:00.000Z"),
        deviceId: "device-1",
        data: {
          routines: [],
          dailyProgress: null,
          dailyHistory: {},
          settings: {},
          pomodoroHistory: {},
          workSessionHistory: {},
          workTemplates: [],
          weightHistory: {},
          journalHistory: {},
          budgetData: { budgets: {}, expenses: {} },
          mealHistory: {},
          presets: [],
          todoLists: [],
        },
      },
    ]);
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
    render(<SyncManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("適用")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("適用"));

    await waitFor(() => {
      expect(applySyncSnapshot).toHaveBeenCalledWith("snapshot-1");
      expect(reloadAfterDownload).toHaveBeenCalled();
    });
  });

  it("任意の同期履歴を削除できる", async () => {
    render(<SyncManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("削除")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("削除"));

    await waitFor(() => {
      expect(deleteSyncSnapshot).toHaveBeenCalledWith("snapshot-1");
      expect(screen.queryByText("履歴 1")).toBeNull();
    });
  });
});
