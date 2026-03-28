import { createCloudSyncActionsResult } from "../state/cloudSyncActionsResult";

describe("createCloudSyncActionsResult", () => {
  it("cloud sync handlers を公開 shape に載せる", () => {
    const handleUploadToCloud = jest.fn<Promise<void>, []>();
    const handleDownloadFromCloud = jest.fn<Promise<void>, []>();

    expect(
      createCloudSyncActionsResult({
        handleUploadToCloud,
        handleDownloadFromCloud,
      }),
    ).toEqual({
      handleUploadToCloud,
      handleDownloadFromCloud,
    });
  });
});
