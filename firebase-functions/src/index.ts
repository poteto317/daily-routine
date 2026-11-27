import { getApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";
import { initializeFirebase } from "./firebase-init";
import { syncRoutines as createSyncRoutines } from "./sync";
import { cleanupNotifications as createCleanupNotifications } from "./notificationCleanup";
import { onBugReportCreated as createOnBugReportCreated } from "./bugReport/onBugReportCreated";
import {
  cleanupExpiredBugReportImages as createCleanupExpiredBugReportImages,
  cleanupLateBugReportImage as createCleanupLateBugReportImage,
  submitBugReportWithImages as createSubmitBugReportWithImages,
} from "./bugReport/imageIntake/imageReportFunctions";
import { agentApi as createAgentApi } from "./agentApi/agentApi";

const db = initializeFirebase();

setGlobalOptions({ maxInstances: 10 });

// 各関数をエクスポート
export const syncRoutines = createSyncRoutines(db);
// checkNotifications はプッシュ通知未使用のため未エクスポート（Scheduler 停止済み）
export const cleanupNotifications = createCleanupNotifications(db);
export const onBugReportCreated = createOnBugReportCreated(db);
export const agentApi = createAgentApi(db);
// Storage を有効にしていない環境でも既存の関数をデプロイできる。
const reportImageBucket = getApp().options.storageBucket;
export const submitBugReportWithImages = reportImageBucket
  ? createSubmitBugReportWithImages(db)
  : undefined;
export const cleanupExpiredBugReportImages = reportImageBucket
  ? createCleanupExpiredBugReportImages(db)
  : undefined;
export const cleanupLateBugReportImage = reportImageBucket
  ? createCleanupLateBugReportImage(db, reportImageBucket)
  : undefined;
