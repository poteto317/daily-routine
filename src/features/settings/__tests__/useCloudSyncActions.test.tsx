import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/sync", () => ({
  uploadToFirestore: jest.fn(),
  downloadFromFirestore: jest.fn(),
}));

jest.mock("../state/cloudSyncActionsResult", () => ({
  createCloudSyncActionsResult: jest.fn(),
}));

import { downloadFromFirestore, uploadToFirestore } from "@/features/sync";
import { CLOUD_SYNC_MESSAGES } from "../helpers/cloudSync";
import { createCloudSyncActionsResult } from "../state/cloudSyncActionsResult";
import { useCloudSyncActions } from "../state/useCloudSyncActions";

describe("useCloudSyncActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("upload 成功時に upload を実行して成功 alert を出す", async () => {
    const resultShape = {
      handleUploadToCloud: jest.fn(),
      handleDownloadFromCloud: jest.fn(),
      composed: true,
    };
    (createCloudSyncActionsResult as jest.Mock).mockReturnValue(resultShape);

    const { result } = renderHook(() => useCloudSyncActions());

    expect(result.current).toBe(resultShape);
    expect(createCloudSyncActionsResult).toHaveBeenCalledWith({
      handleUploadToCloud: expect.any(Function),
      handleDownloadFromCloud: expect.any(Function),
    });

    const builtHandleUploadToCloud = (createCloudSyncActionsResult as jest.Mock)
      .mock.calls[0][0].handleUploadToCloud as () => Promise<void>;

    await act(async () => {
      await builtHandleUploadToCloud();
    });

    expect(window.confirm).toHaveBeenCalledWith(
      CLOUD_SYNC_MESSAGES.confirmUpload,
    );
    expect(uploadToFirestore).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      CLOUD_SYNC_MESSAGES.uploadSuccess,
    );
  });

  it("confirm が false なら upload/download を中断する", async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    (createCloudSyncActionsResult as jest.Mock).mockReturnValue({
      handleUploadToCloud: jest.fn(),
      handleDownloadFromCloud: jest.fn(),
    });
    renderHook(() => useCloudSyncActions());

    const builtActions = (createCloudSyncActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleUploadToCloud: () => Promise<void>;
      handleDownloadFromCloud: () => Promise<void>;
    };

    await act(async () => {
      await builtActions.handleUploadToCloud();
      await builtActions.handleDownloadFromCloud();
    });

    expect(uploadToFirestore).not.toHaveBeenCalled();
    expect(downloadFromFirestore).not.toHaveBeenCalled();
  });

  it("download 失敗時に error を記録して alert を出す", async () => {
    const error = new Error("download failed");
    (downloadFromFirestore as jest.Mock).mockRejectedValue(error);
    (createCloudSyncActionsResult as jest.Mock).mockReturnValue({
      handleUploadToCloud: jest.fn(),
      handleDownloadFromCloud: jest.fn(),
    });
    renderHook(() => useCloudSyncActions());

    const builtHandleDownloadFromCloud = (
      createCloudSyncActionsResult as jest.Mock
    ).mock.calls[0][0].handleDownloadFromCloud as () => Promise<void>;

    await act(async () => {
      await builtHandleDownloadFromCloud();
    });

    expect(window.confirm).toHaveBeenCalledWith(
      CLOUD_SYNC_MESSAGES.confirmDownload,
    );
    expect(downloadFromFirestore).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(window.alert).toHaveBeenCalledWith(
      CLOUD_SYNC_MESSAGES.downloadError,
    );
  });
});
