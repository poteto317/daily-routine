import type { Firestore } from "../adminSdk";
import { FieldValue } from "../adminSdk";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getStorage } from "firebase-admin/storage";
import { BUG_REPORTS_COLLECTION } from "./constants";
import {
  anthropicApiKey,
  bugReportProjectDailyLimit,
  bugReportUserDailyLimit,
  scrumBoardCredentials,
  scrumBoardOrigin,
  scrumBoardProjectId,
} from "./config";
import { handleBugReport } from "./handleBugReport";
import { claimBugReportProcessing } from "./claimBugReportProcessing";
import { createStorageImageStore } from "./storageImageStore";

/**
 * bugReports ドキュメント作成時に スクラムかんばんの Todo にアイテムを自動作成する Firestore トリガ。
 * 実際の Issue 作成・書き戻し・冪等性は processBugReport に委譲する。
 */
export const onBugReportCreated = (db: Firestore) =>
  onDocumentCreated(
    {
      document: `${BUG_REPORTS_COLLECTION}/{reportId}`,
      region: "asia-northeast1",
      // Claude 最大 45 秒（画像つきの失敗後に画像なしで再整形して最大 45 秒）+ かんばん API 最大 30 秒 + 画像の取得・Firestore の読み書きが収まる長さ
      timeoutSeconds: 180,
      memory: "512MiB",
      secrets: [scrumBoardCredentials, anthropicApiKey],
    },
    async (event) => {
      if (!event.data) {
        return;
      }
      const reportId = event.params.reportId;
      const projectId = scrumBoardProjectId.value();

      await handleBugReport(reportId, db, {
        origin: scrumBoardOrigin.value(),
        projectId,
        credentials: scrumBoardCredentials.value(),
        anthropicApiKey: anthropicApiKey.value(),
        createImageStore: () => createStorageImageStore(getStorage().bucket()),
        logger,
        now: () => FieldValue.serverTimestamp(),
        claimProcessing: () =>
          claimBugReportProcessing(db, {
            reportId,
            projectId,
            userLimit: bugReportUserDailyLimit.value(),
            projectLimit: bugReportProjectDailyLimit.value(),
            nowMs: Date.now(),
          }),
      });
    },
  );
