import { createHeaderSyncFeedbackActionsResult } from "@/hooks/headerSyncFeedbackActionsResult";

describe("createHeaderSyncFeedbackActionsResult", () => {
  it("feedback action の公開 shape を組み立てる", () => {
    const handleUploadClick = jest.fn();
    const handleDownloadClick = jest.fn();

    expect(
      createHeaderSyncFeedbackActionsResult({
        handleUploadClick,
        handleDownloadClick,
      }),
    ).toEqual({
      handleUploadClick,
      handleDownloadClick,
    });
  });
});
