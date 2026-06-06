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
      const snapshot = event.data;
      if (!snapshot) {
        return;
      }

      const report = snapshot.data() as ProcessableBugReport;
      const reportId = event.params.reportId;
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
    },
  );
