import { createHeaderSyncActionsResult } from "@/hooks/headerSyncActionsResult";

describe("createHeaderSyncActionsResult", () => {
  it("header sync action の公開 shape を組み立てる", () => {
    const handleUpload = jest.fn();
    const handleDownload = jest.fn();

    expect(
      createHeaderSyncActionsResult({
        handleUpload,
        handleDownload,
      }),
    ).toEqual({
      handleUpload,
      handleDownload,
    });
  });
});
