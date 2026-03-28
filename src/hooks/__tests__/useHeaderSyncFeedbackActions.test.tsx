import { act, renderHook } from "@testing-library/react";

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

    expect(handleUpload).toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).toHaveBeenCalledWith({
      result: "uploaded",
    });
  });

  it("download 結果に応じてフィードバックを適用する", async () => {
    const handleUpload = jest.fn();
    const handleDownload = jest.fn().mockResolvedValue("downloaded");
    renderHook(() =>
      useHeaderSyncFeedbackActions({
        handleUpload,
        handleDownload,
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

    expect(handleDownload).toHaveBeenCalled();
    expect(applyHeaderSyncFeedback).toHaveBeenCalledWith({
      result: "downloaded",
    });
  });
});
