import type { Firestore } from "../adminSdk";
import { FieldValue } from "../adminSdk";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import type { Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { anthropicApiKey, githubToken, githubRepo } from "./config";
import { handleBugReport } from "./handleBugReport";
import { canClaimProcessing } from "./canClaimProcessing";
import { createStorageImageStore } from "./storageImageStore";

/**
 * bugReports ドキュメント作成時に GitHub Issue を自動作成する Firestore トリガ。
 * 実際の Issue 作成・書き戻し・冪等性は processBugReport に委譲する。
 */
export const onBugReportCreated = (db: Firestore) =>
  onDocumentCreated(
    {
      document: `${BUG_REPORTS_COLLECTION}/{reportId}`,
      region: "asia-northeast1",
      // Claude 最大 45 秒（画像つきの失敗後に画像なしで再整形して最大 45 秒）+ GitHub 最大 30 秒 + 画像の取得・Firestore の読み書きが収まる長さ
      timeoutSeconds: 180,
      memory: "512MiB",
      secrets: [githubToken, anthropicApiKey],
    },
    async (event) => {
      if (!event.data) {
        return;
      }
      const reportId = event.params.reportId;
      const docRef = db.collection(BUG_REPORTS_COLLECTION).doc(reportId);

      // pending → processing へトランザクション的にアトミック更新（期限付きロック）。
      // canClaimProcessing が取得条件を一元判定（pending / stale processing で許可）。
      const claimProcessing = async (): Promise<boolean> => {
        let claimed = false;
        await db.runTransaction(async (t) => {
          claimed = false; // トランザクション再試行時にリセット
          const snap = await t.get(docRef);
          const data = snap.data() as
            | { status?: string; processingAt?: Timestamp }
            | undefined;
          if (!data) return;

          const processingAtMs = data.processingAt
            ? data.processingAt.toMillis()
            : undefined;
          if (!canClaimProcessing(data.status, processingAtMs, Date.now())) {
            return;
          }

          t.update(docRef, {
            status: "processing",
            processingAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          claimed = true;
        });
        return claimed;
      };

      await handleBugReport(reportId, db, {
        repo: githubRepo.value(),
        token: githubToken.value(),
        anthropicApiKey: anthropicApiKey.value(),
        createImageStore: () => createStorageImageStore(getStorage().bucket()),
        logger,
        now: () => FieldValue.serverTimestamp(),
        claimProcessing,
      });
    },
  );
