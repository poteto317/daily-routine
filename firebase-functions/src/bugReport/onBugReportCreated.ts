import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import type * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { githubToken, githubRepo } from "./config";
import { handleBugReport } from "./handleBugReport";

/**
 * bugReports ドキュメント作成時に GitHub Issue を自動作成する Firestore トリガ。
 * 実際の Issue 作成・書き戻し・冪等性は processBugReport に委譲する。
 */
export const onBugReportCreated = (db: admin.firestore.Firestore) =>
  onDocumentCreated(
    {
      document: `${BUG_REPORTS_COLLECTION}/{reportId}`,
      region: "asia-northeast1",
      secrets: [githubToken],
    },
    async (event) => {
      if (!event.data) {
        return;
      }
      const reportId = event.params.reportId;
      const docRef = db.collection(BUG_REPORTS_COLLECTION).doc(reportId);

      // pending → processing へトランザクション的にアトミック更新。
      // 他の実行が既にロック済みなら false を返し二重作成を防ぐ。
      const claimProcessing = async (): Promise<boolean> => {
        let claimed = false;
        await db.runTransaction(async (t) => {
          claimed = false; // トランザクション再試行時にリセット
          const snap = await t.get(docRef);
          const data = snap.data() as { status?: string } | undefined;
          if (data?.status !== "pending") return;
          t.update(docRef, {
            status: "processing",
            updatedAt: FieldValue.serverTimestamp(),
          });
          claimed = true;
        });
        return claimed;
      };

      await handleBugReport(reportId, db, {
        repo: githubRepo.value(),
        token: githubToken.value(),
        logger,
        now: () => FieldValue.serverTimestamp(),
        claimProcessing,
      });
    },
  );
