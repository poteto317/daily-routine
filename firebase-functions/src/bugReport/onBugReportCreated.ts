import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import type * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { createGithubIssue } from "./createGithubIssue";
import {
  processBugReport,
  type ProcessableBugReport,
} from "./processBugReport";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { githubToken, githubRepo } from "./config";

/**
 * bugReports ドキュメント作成トリガの実処理。
 * event.data はトリガ時のスナップショットであり、Cloud Functions リトライ時は
 * status/issueNumber が古い可能性があるため Firestore から最新を読み直して渡す。
 */
export const handleBugReportCreated = async (
  reportId: string,
  db: admin.firestore.Firestore,
): Promise<void> => {
  const latestSnap = await db
    .collection(BUG_REPORTS_COLLECTION)
    .doc(reportId)
    .get();
  if (!latestSnap.exists) {
    return;
  }

  const report = latestSnap.data() as ProcessableBugReport;
  const repo = githubRepo.value();

  try {
    const result = await processBugReport(report, {
      createIssue: (content) =>
        createGithubIssue({ token: githubToken.value(), repo, content }),
      updateReport: async (fields) => {
        await db
          .collection(BUG_REPORTS_COLLECTION)
          .doc(reportId)
          .update(fields);
      },
      now: () => FieldValue.serverTimestamp(),
    });

    logger.info(
      `Bug report ${reportId} processed: ${result} (repo=${repo})`,
    );
  } catch (error) {
    logger.error(`Bug report ${reportId} processing threw an exception`, {
      error,
    });
    throw error;
  }
};

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
      await handleBugReportCreated(event.params.reportId, db);
    },
  );
