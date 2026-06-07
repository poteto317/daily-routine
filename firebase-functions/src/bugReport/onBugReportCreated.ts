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
      await handleBugReport(event.params.reportId, db, {
        repo: githubRepo.value(),
        token: githubToken.value(),
        logger,
        now: () => FieldValue.serverTimestamp(),
      });
    },
  );
