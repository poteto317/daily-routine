import { act, renderHook } from "@testing-library/react";
import texts from "@/layouts/texts";

jest.mock("@/hooks/headerSyncFeedback", () => ({
  applyHeaderSyncFeedback: jest.fn(),
}));

jest.mock("@/hooks/headerSyncFeedbackActionsResult", () => ({
  createHeaderSyncFeedbackActionsResult: jest.fn(),
}));

import { applyHeaderSyncFeedback } from "@/hooks/headerSyncFeedback";
import { createHeaderSyncFeedbackActionsResult } from "@/hooks/headerSyncFeedbackActionsResult";
import { useHeaderSyncFeedbackActions } from "@/hooks/useHeaderSyncFeedbackActions";

describe("useHeaderSyncFeedbackActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHeaderSyncFeedbackActionsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("upload 結果に応じてフィードバックを適用する", async () => {
    const handleUpload = jest.fn().mockResolvedValue("uploaded");
    const handleDownload = jest.fn();
    const confirmAction = jest.fn().mockReturnValue(true);
    const resultShape = {
      handleUploadClick: jest.fn(),
      handleDownloadClick: jest.fn(),
      composed: true,
    };
    (createHeaderSyncFeedbackActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useHeaderSyncFeedbackActions({
        handleUpload,
        handleDownload,
        confirmAction,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(createHeaderSyncFeedbackActionsResult).toHaveBeenCalledWith({
      handleUploadClick: expect.any(Function),
      handleDownloadClick: expect.any(Function),
    });

    const builtActions = (createHeaderSyncFeedbackActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleUploadClick: () => Promise<void>;
      handleDownloadClick: () => Promise<void>;
    };

    await act(async () => {
      await builtActions.handleUploadClick();
    });

    expect(confirmAction).toHaveBeenCalledWith(
      texts.headerSyncButton.uploadConfirm,
    );
    expect(handleUpload).toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).toHaveBeenCalledWith({
      result: "uploaded",
    });
  });

  it("download 結果に応じてフィードバックを適用する", async () => {
    const handleUpload = jest.fn();
    const handleDownload = jest.fn().mockResolvedValue("downloaded");
    const confirmAction = jest.fn().mockReturnValue(true);
    renderHook(() =>
      useHeaderSyncFeedbackActions({
        handleUpload,
        handleDownload,
        confirmAction,
      }),
    );

    const builtActions = (createHeaderSyncFeedbackActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleUploadClick: () => Promise<void>;
      handleDownloadClick: () => Promise<void>;
    };

    await act(async () => {
      await builtActions.handleDownloadClick();
    });

    expect(confirmAction).toHaveBeenCalledWith(
      texts.headerSyncButton.downloadConfirm,
    );
    expect(handleDownload).toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).toHaveBeenCalledWith({
      result: "downloaded",
    });
  });

  it("確認ダイアログでキャンセルするとアップロードを実行しない", async () => {
    const handleUpload = jest.fn();
    const handleDownload = jest.fn();
    const confirmAction = jest.fn().mockReturnValue(false);
    renderHook(() =>
      useHeaderSyncFeedbackActions({
        handleUpload,
        handleDownload,
        confirmAction,
      }),
    );

    const builtActions = (createHeaderSyncFeedbackActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleUploadClick: () => Promise<void>;
      handleDownloadClick: () => Promise<void>;
    };

    await act(async () => {
      await builtActions.handleUploadClick();
    });

    expect(confirmAction).toHaveBeenCalledWith(
      texts.headerSyncButton.uploadConfirm,
    );
    expect(handleUpload).not.toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).not.toHaveBeenCalled();
  });

  it("確認ダイアログでキャンセルするとダウンロードを実行しない", async () => {
    const handleUpload = jest.fn();
    const handleDownload = jest.fn();
    const confirmAction = jest.fn().mockReturnValue(false);
    renderHook(() =>
      useHeaderSyncFeedbackActions({
        handleUpload,
        handleDownload,
        confirmAction,
      }),
    );

    const builtActions = (createHeaderSyncFeedbackActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleUploadClick: () => Promise<void>;
      handleDownloadClick: () => Promise<void>;
    };

    await act(async () => {
      await builtActions.handleDownloadClick();
    });

    expect(confirmAction).toHaveBeenCalledWith(
      texts.headerSyncButton.downloadConfirm,
    );
    expect(handleDownload).not.toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).not.toHaveBeenCalled();
  });
});
