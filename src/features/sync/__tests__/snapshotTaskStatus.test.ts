import { FirebaseError } from "@/lib/firebase-modules/error";
import { getSyncStatus, setSyncStatus } from "../sync/statusStore";
import { runSnapshotTask } from "../sync/snapshotTaskStatus";

// Firebase の初期化を避け、エラー型だけ本物を使う
jest.mock("@/lib/firebase", () => ({
  FirebaseError: jest.requireActual("@/lib/firebase-modules/error")
    .FirebaseError,
}));

const OPTIONS = { fallbackMessage: "定型文", errorCode: "task-failed" };

describe("runSnapshotTask", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("実行中は同期中にして前のエラーを消し、成功したら同期中を解除して結果を返す", async () => {
    setSyncStatus({ error: "前のエラー", hasLocalChanges: true });
    let statusDuringTask: ReturnType<typeof getSyncStatus> | undefined;

    const result = await runSnapshotTask(async () => {
      statusDuringTask = getSyncStatus();
      return "結果";
    }, OPTIONS);

    expect(result).toBe("結果");
    expect(statusDuringTask).toMatchObject({ isSyncing: true, error: null });
    // 既定の成功状態は同期中とエラーだけを変え、他の項目は残す
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      error: null,
      hasLocalChanges: true,
    });
  });

  it("successStatus を渡すと、成功時にその状態を反映する", async () => {
    await runSnapshotTask(async () => undefined, {
      ...OPTIONS,
      successStatus: () => ({ isSyncing: false, lastSyncTime: 123 }),
    });

    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      lastSyncTime: 123,
    });
  });

  it("失敗したら errorCode の FirebaseError を投げ、Firebase の語を除いた文言を状態に残す", async () => {
    const promise = runSnapshotTask(async () => {
      throw new Error("Firebase: Firestore unavailable");
    }, OPTIONS);

    await expect(promise).rejects.toBeInstanceOf(FirebaseError);
    await expect(promise).rejects.toMatchObject({
      code: "task-failed",
      message: ": データベース unavailable",
    });
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      error: ": データベース unavailable",
    });
  });

  it("Error 以外で失敗したら定型文を使う", async () => {
    await expect(
      runSnapshotTask(() => Promise.reject("文字列"), OPTIONS),
    ).rejects.toMatchObject({ code: "task-failed", message: "定型文" });
    expect(getSyncStatus().error).toBe("定型文");
  });

  it("successStatus の反映で失敗しても、失敗として扱う", async () => {
    await expect(
      runSnapshotTask(async () => "結果", {
        ...OPTIONS,
        successStatus: () => {
          throw new Error("状態の計算に失敗");
        },
      }),
    ).rejects.toMatchObject({
      code: "task-failed",
      message: "状態の計算に失敗",
    });
    expect(getSyncStatus()).toMatchObject({
      isSyncing: false,
      error: "状態の計算に失敗",
    });
  });
});
