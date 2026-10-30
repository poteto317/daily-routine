import type { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { BugReport, ProcessableBugReport } from "../types";

/**
 * 型定義の契約をコンパイル時に検証するためのテスト。
 * 実行時のアサーションは最小限だが、TypeScript の型チェックが本体。
 * 失敗時は `npx tsc --noEmit` で検出される。
 */

describe("BugReport / ProcessableBugReport 型契約", () => {
  it("BugReport.processingAt は Timestamp | FieldValue を受け入れる（Firestore 実態と一致）", () => {
    // 読み取り時: Timestamp
    const readShape: Pick<BugReport, "processingAt"> = {
      processingAt: undefined as unknown as Timestamp,
    };
    // 書き込み時: FieldValue.serverTimestamp() 相当
    const writeShape: Pick<BugReport, "processingAt"> = {
      processingAt: undefined as unknown as FieldValue,
    };
    expect(readShape).toBeDefined();
    expect(writeShape).toBeDefined();
  });

  it("BugReport.processingAt は省略可能（クライアント作成直後の pending では未設定）", () => {
    const shape: Pick<BugReport, "processingAt"> = {};
    expect(shape).toBeDefined();
  });

  it("ProcessableBugReport には processingAt フィールドが存在しない（firebase 非依存）", () => {
    // 型レベルで processingAt キーを含まないことを検証。
    // 'processingAt' in ProcessableBugReport が型エラーになる形では書けないので、
    // keyof で表現可能なキーから除外されていることを確認する。
    type Keys = keyof ProcessableBugReport;
    type HasProcessingAt = "processingAt" extends Keys ? true : false;
    const hasProcessingAt: HasProcessingAt = false;
    expect(hasProcessingAt).toBe(false);
  });

  it("BugReport.images は省略可能で ProcessableBugReport にそのまま代入できる", () => {
    const withImages: Pick<
      BugReport,
      "uid" | "description" | "status" | "images"
    > = {
      uid: "u1",
      description: "desc",
      status: "pending",
      images: [
        {
          path: "bugReports/u1/r1/a.png",
          contentType: "image/png",
          size: 123,
        },
      ],
    };
    const processable: ProcessableBugReport = withImages;
    expect(processable.images).toEqual(withImages.images);
  });
});
