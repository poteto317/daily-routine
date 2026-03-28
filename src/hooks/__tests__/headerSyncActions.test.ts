import {
  mockDownloadFromFirestore,
  mockUploadToFirestore,
  setupHeaderHooksMocks,
} from "./header-hooks.test-setup";
import {
  runHeaderDownload,
  runHeaderSyncAction,
  runHeaderUpload,
} from "@/hooks/headerSyncActions";

describe("headerSyncActions", () => {
  beforeEach(() => {
    setupHeaderHooksMocks();
  });

  it("sync中は共通アクションがskippedを返す", async () => {
    await expect(
      runHeaderSyncAction({
        isSyncing: true,
        run: jest.fn(),
        successResult: "uploaded",
      }),
    ).resolves.toBe("skipped");
  });

  it("アップロード成功時はuploadedを返す", async () => {
    mockUploadToFirestore.mockResolvedValue(undefined);

    await expect(runHeaderUpload(false)).resolves.toBe("uploaded");
    expect(mockUploadToFirestore).toHaveBeenCalledTimes(1);
  });

  it("ダウンロード成功時はdownloadedを返す", async () => {
    mockDownloadFromFirestore.mockResolvedValue(undefined);

    await expect(runHeaderDownload(false)).resolves.toBe("downloaded");
    expect(mockDownloadFromFirestore).toHaveBeenCalledWith({ reload: false });
  });

  it("同期処理失敗時はfailedを返す", async () => {
    mockUploadToFirestore.mockRejectedValue(new Error("sync error"));

    await expect(runHeaderUpload(false)).resolves.toBe("failed");
  });
});
