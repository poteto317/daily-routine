import { render, screen } from "@testing-library/react";
import { setupSettingsPageMocks } from "./SettingsPage.test.utils";
import { SettingsPage } from "../SettingsPage";

describe("SettingsPage sync", () => {
  const { mockGetSyncStatus } = setupSettingsPageMocks();

  it("同期情報があってもクラウド同期セクションは表示しない", () => {
    mockGetSyncStatus.mockReturnValue({
      lastSynced: "2024-06-15T10:00:00Z",
      isSyncing: false,
      error: null,
    });
    render(<SettingsPage />);
    expect(screen.queryByText("☁️ クラウド同期")).not.toBeInTheDocument();
  });

  it("同期エラー時もクラウド同期セクションは表示しない", () => {
    mockGetSyncStatus.mockReturnValue({
      lastSynced: null,
      isSyncing: false,
      error: "同期に失敗しました",
    });
    render(<SettingsPage />);
    expect(screen.queryByText("☁️ クラウド同期")).not.toBeInTheDocument();
  });
});
