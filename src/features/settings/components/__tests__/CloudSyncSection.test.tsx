import { render, screen, fireEvent } from "@testing-library/react";
import { CloudSyncSection } from "../CloudSyncSection";
import texts from "../../locales/ja.json";
import { type SyncStatus } from "@/features/sync";

describe("CloudSyncSection", () => {
  const baseSyncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    hasLocalChanges: false,
    hasRemoteChanges: false,
  };

  const defaultProps = {
    syncStatus: baseSyncStatus,
    handleUploadToCloud: jest.fn().mockResolvedValue(undefined),
    handleDownloadFromCloud: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("基本情報、警告文、説明文、ボタンをレンダリングする", () => {
    render(<CloudSyncSection {...defaultProps} />);

    expect(screen.getByText(texts.cloudSync.title)).toBeInTheDocument();
    expect(
      screen.getByText(texts.cloudSync.warningMessage),
    ).toBeInTheDocument();
    expect(screen.getByText(texts.cloudSync.description)).toBeInTheDocument();
    expect(screen.getByText(texts.cloudSync.hint)).toBeInTheDocument();

    const uploadButton = screen.getByRole("button", {
      name: /クラウドにアップロード/,
    });
    const downloadButton = screen.getByRole("button", {
      name: /クラウドからダウンロード/,
    });

    expect(uploadButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });

  it("アップロードボタンをクリックすると handleUploadToCloud が呼ばれる", () => {
    render(<CloudSyncSection {...defaultProps} />);

    const uploadButton = screen.getByRole("button", {
      name: /クラウドにアップロード/,
    });
    fireEvent.click(uploadButton);

    expect(defaultProps.handleUploadToCloud).toHaveBeenCalledTimes(1);
  });

  it("ダウンロードボタンをクリックすると handleDownloadFromCloud が呼ばれる", () => {
    render(<CloudSyncSection {...defaultProps} />);

    const downloadButton = screen.getByRole("button", {
      name: /クラウドからダウンロード/,
    });
    fireEvent.click(downloadButton);

    expect(defaultProps.handleDownloadFromCloud).toHaveBeenCalledTimes(1);
  });

  it("同期中 (isSyncing: true) の場合は同期中ラベルが表示され、ボタンが無効化される", () => {
    const syncingStatus: SyncStatus = {
      ...baseSyncStatus,
      isSyncing: true,
    };

    render(<CloudSyncSection {...defaultProps} syncStatus={syncingStatus} />);

    expect(screen.getByText("同期中...")).toBeInTheDocument();

    const uploadButton = screen.getByRole("button", {
      name: /クラウドにアップロード/,
    });
    const downloadButton = screen.getByRole("button", {
      name: /クラウドからダウンロード/,
    });

    expect(uploadButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  it("最終同期日時、ローカル変更、リモート変更、エラーメッセージを表示する", () => {
    const complexStatus: SyncStatus = {
      isSyncing: false,
      lastSyncTime: 1710500000000,
      error: "認証に失敗しました",
      hasLocalChanges: true,
      hasRemoteChanges: true,
    };

    render(<CloudSyncSection {...defaultProps} syncStatus={complexStatus} />);

    expect(screen.getByText(new RegExp(texts.cloudSync.lastSyncPrefix))).toBeInTheDocument();
    expect(
      screen.getByText(texts.cloudSync.remoteChangesMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByText(texts.cloudSync.localChangesMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(complexStatus.error!)),
    ).toBeInTheDocument();
  });
});
