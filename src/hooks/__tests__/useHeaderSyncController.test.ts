import { act, renderHook } from "@testing-library/react";
import { setupHeaderHooksMocks } from "./header-hooks.test-setup";
import { useHeaderSyncController } from "@/hooks/useHeaderSyncController";
import { getHeaderSyncFeedbackMessage } from "@/hooks/headerSyncMessages";

jest.mock("@/hooks/headerSyncControllerResult", () => ({
  createHeaderSyncControllerResult: jest.fn(),
}));

jest.mock("@/hooks/useHeaderSyncFeedbackActions", () => ({
  useHeaderSyncFeedbackActions: jest.fn(),
}));

import { createHeaderSyncControllerResult } from "@/hooks/headerSyncControllerResult";
import { useHeaderSyncFeedbackActions } from "@/hooks/useHeaderSyncFeedbackActions";

describe("useHeaderSyncController", () => {
  beforeEach(() => {
    setupHeaderHooksMocks();
    jest.clearAllMocks();
  });

  it("結果ごとのメッセージを返す", () => {
    expect(getHeaderSyncFeedbackMessage("uploaded")).toBe(
      "現在のローカルデータをクラウドへアップロードしました。",
    );
    expect(getHeaderSyncFeedbackMessage("downloaded")).toBe(
      "最後にアップロードされたクラウドデータをダウンロードして反映します。",
    );
    expect(getHeaderSyncFeedbackMessage("failed")).toBe(
      "同期に失敗しました。通信状況を確認して再試行してください。",
    );
    expect(getHeaderSyncFeedbackMessage("skipped")).toBeNull();
  });

  it("sync hook と feedback action hook を compose する", async () => {
    const handleUploadClick = jest.fn().mockResolvedValue(undefined);
    const handleDownloadClick = jest.fn().mockResolvedValue(undefined);
    const controllerResult = {
      syncStatus: { isSyncing: false, message: "同期済み", timestamp: null },
      handleUploadClick,
      handleDownloadClick,
    };

    (useHeaderSyncFeedbackActions as jest.Mock).mockReturnValue({
      handleUploadClick,
      handleDownloadClick,
    });
    (createHeaderSyncControllerResult as jest.Mock).mockReturnValue(
      controllerResult,
    );

    const { result } = renderHook(() => useHeaderSyncController());

    expect(useHeaderSyncFeedbackActions).toHaveBeenCalledWith({
      handleUpload: expect.any(Function),
      handleDownload: expect.any(Function),
    });
    expect(createHeaderSyncControllerResult).toHaveBeenCalledWith({
      syncStatus: expect.objectContaining({
        isSyncing: false,
        lastSyncTime: null,
        hasLocalChanges: false,
        hasRemoteChanges: false,
        error: null,
      }),
      handleUploadClick,
      handleDownloadClick,
    });
    expect(result.current).toBe(controllerResult);

    await act(async () => {
      await result.current.handleUploadClick();
      await result.current.handleDownloadClick();
    });

    expect(handleUploadClick).toHaveBeenCalled();
    expect(handleDownloadClick).toHaveBeenCalled();
  });
});
