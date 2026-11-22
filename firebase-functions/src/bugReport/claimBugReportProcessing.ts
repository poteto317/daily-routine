import { createHash } from "node:crypto";
import type { DocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { FieldValue, type Firestore } from "../adminSdk";
import { canClaimProcessing } from "./canClaimProcessing";
import { BUG_REPORTS_COLLECTION } from "./constants";

type ClaimOptions = {
  reportId: string;
  projectId: number;
  userLimit: string;
  projectLimit: string;
  nowMs: number;
};

const readLimit = (value: string, name: string): number => {
  const limit = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(limit)) {
    throw new Error(`Invalid ${name}: expected a nonnegative safe integer`);
  }
  return limit;
};

const readCount = (snapshot: DocumentSnapshot): number => {
  if (!snapshot.exists) return 0;
  const count: unknown = snapshot.data()?.count;
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
    throw new Error("Invalid bug report budget counter");
  }
  return count;
};

/** 確定したトランザクションで両方の枠と処理ロックを確保する。 */
export const claimBugReportProcessing = async (
  db: Firestore,
  options: ClaimOptions,
): Promise<boolean> => {
  const { reportId, projectId, nowMs } = options;
  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    throw new Error("Invalid SCRUM_BOARD_PROJECT_ID");
  }
  const userLimit = readLimit(options.userLimit, "BUG_REPORT_USER_DAILY_LIMIT");
  const projectLimit = readLimit(
    options.projectLimit,
    "BUG_REPORT_PROJECT_DAILY_LIMIT",
  );
  const day = new Date(nowMs).toISOString().slice(0, 10);
  const projectBudget = db
    .collection("bugReportProcessingBudgets")
    .doc(`${projectId}_${day}`);
  const report = db.collection(BUG_REPORTS_COLLECTION).doc(reportId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(report);
    const data = snapshot.data() as
      | {
          uid?: unknown;
          status?: string;
          issueNumber?: number;
          processingAt?: Timestamp;
        }
      | undefined;
    if (!data || data.issueNumber != null) return false;
    if (
      !canClaimProcessing(data.status, data.processingAt?.toMillis(), nowMs)
    ) {
      return false;
    }
    if (typeof data.uid !== "string" || data.uid.length === 0) {
      throw new Error("Missing bug report owner");
    }

    const userKey = createHash("sha256").update(data.uid).digest("hex");
    const userBudget = projectBudget.collection("users").doc(userKey);
    const userCount = readCount(await transaction.get(userBudget));
    const projectCount = readCount(await transaction.get(projectBudget));
    const updatedAt = FieldValue.serverTimestamp();

    if (userCount >= userLimit || projectCount >= projectLimit) {
      transaction.update(report, {
        status: "error",
        errorCode: "quota_exceeded",
        errorMessage: "Daily processing quota exceeded",
        updatedAt,
      });
      return false;
    }

    transaction.set(userBudget, { count: userCount + 1 });
    transaction.set(projectBudget, { count: projectCount + 1 });
    transaction.update(report, {
      status: "processing",
      processingAt: updatedAt,
      updatedAt,
    });
    return true;
  });
};
