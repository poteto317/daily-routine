import { act, renderHook } from "@testing-library/react";
import { createHeaderSyncActionsResult } from "@/hooks/headerSyncActionsResult";
import {
  mockDownloadFromFirestore,
  mockUploadToFirestore,
  setupHeaderHooksMocks,
} from "./header-hooks.test-setup";
import { useHeaderSyncActions } from "@/hooks/useHeaderSyncActions";

jest.mock("@/hooks/headerSyncActionsResult", () => ({
  createHeaderSyncActionsResult: jest.fn(),
}));

describe("useHeaderSyncActions", () => {
  beforeEach(() => {
    setupHeaderHooksMocks();
    (createHeaderSyncActionsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("sync中はskippedを返して同期APIを呼ばない", async () => {
    const resultShape = {
      handleUpload: jest.fn(),
      handleDownload: jest.fn(),
      composed: true,
    };
    (createHeaderSyncActionsResult as jest.Mock).mockReturnValue(resultShape);
    const { result } = renderHook(() => useHeaderSyncActions(true));

    expect(result.current).toBe(resultShape);
    expect(createHeaderSyncActionsResult).toHaveBeenCalledWith({
      handleUpload: expect.any(Function),
      handleDownload: expect.any(Function),
    });

    const builtActions = (createHeaderSyncActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleUpload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
      handleDownload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
    };

    let syncResult: Awaited<
      ReturnType<typeof builtActions.handleUpload>
    > | null = null;
    await act(async () => {
      syncResult = await builtActions.handleUpload();
    });

    expect(syncResult).toBe("skipped");
    expect(mockUploadToFirestore).not.toHaveBeenCalled();
    expect(mockDownloadFromFirestore).not.toHaveBeenCalled();
  });

  it("アップロード成功時はuploadedを返す", async () => {
    mockUploadToFirestore.mockResolvedValue(undefined);
    renderHook(() => useHeaderSyncActions(false));

    const builtActions = (createHeaderSyncActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleUpload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
      handleDownload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
    };

    let syncResult: Awaited<
      ReturnType<typeof builtActions.handleUpload>
    > | null = null;
    await act(async () => {
      syncResult = await builtActions.handleUpload();
    });

    expect(syncResult).toBe("uploaded");
    expect(mockUploadToFirestore).toHaveBeenCalledTimes(1);
  });

  it("ダウンロード成功時はdownloadedを返す", async () => {
    mockDownloadFromFirestore.mockResolvedValue(undefined);
    renderHook(() => useHeaderSyncActions(false));

    const builtActions = (createHeaderSyncActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleUpload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
      handleDownload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
    };

    let syncResult: Awaited<
      ReturnType<typeof builtActions.handleDownload>
    > | null = null;
    await act(async () => {
      syncResult = await builtActions.handleDownload();
    });

    expect(syncResult).toBe("downloaded");
    expect(mockDownloadFromFirestore).toHaveBeenCalledWith({ reload: false });
  });

  it("同期API失敗時はfailedを返す", async () => {
    mockUploadToFirestore.mockRejectedValue(new Error("sync error"));
    renderHook(() => useHeaderSyncActions(false));

    const builtActions = (createHeaderSyncActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleUpload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
      handleDownload: () => Promise<
        "skipped" | "uploaded" | "downloaded" | "failed"
      >;
    };

    let syncResult: Awaited<
      ReturnType<typeof builtActions.handleUpload>
    > | null = null;
    await act(async () => {
      syncResult = await builtActions.handleUpload();
    });

    expect(syncResult).toBe("failed");
  });
});
