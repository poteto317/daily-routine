import {
  CLOUD_SYNC_MESSAGES,
  SYNC_ACTIONS,
  getFormattedLastSyncTime,
  getSyncActionButtonClassName,
  getSyncingStatusLabel,
} from "../helpers/cloudSync";

describe("settings cloud sync helpers", () => {
  it("同期中ラベルと日時表示を返す", () => {
    const lastSyncTime = new Date("2026-03-17T12:34:56.000Z").getTime();

    expect(getSyncingStatusLabel(true)).toBe("同期中...");
    expect(getSyncingStatusLabel(false)).toBeNull();
    expect(getFormattedLastSyncTime(null)).toBeNull();
    expect(getFormattedLastSyncTime(lastSyncTime)).toBe(
      new Date(lastSyncTime).toLocaleString("ja-JP"),
    );
  });

  it("同期 action ごとの class と文言を返す", () => {
    expect(SYNC_ACTIONS).toEqual([
      { kind: "upload", label: "⬆️ クラウドにアップロード" },
      { kind: "download", label: "⬇️ クラウドからダウンロード" },
    ]);
    expect(getSyncActionButtonClassName("upload", true)).toContain(
      "cursor-not-allowed",
    );
    expect(getSyncActionButtonClassName("upload", false)).toContain(
      "bg-green-600",
    );
    expect(getSyncActionButtonClassName("download", false)).toContain(
      "bg-purple-600",
    );
    expect(CLOUD_SYNC_MESSAGES.confirmUpload).toContain(
      "クラウドにアップロード",
    );
  });
});
