import { buildWorkoutRecordDeleteConfirmMessage } from "../workoutRecordConfirmMessages";
import texts from "../locales/ja.json";

describe("buildWorkoutRecordDeleteConfirmMessage", () => {
  it("種目名を埋め込んだ確認メッセージを組み立てる", () => {
    expect(buildWorkoutRecordDeleteConfirmMessage("ベンチプレス")).toBe(
      texts.page.confirmDeleteTemplate.replace("{name}", "ベンチプレス"),
    );
  });

  it("種目名が異なれば結果も変わる", () => {
    expect(buildWorkoutRecordDeleteConfirmMessage("ジョグ")).toBe(
      "「ジョグ」の記録を削除しますか？",
    );
  });
});
