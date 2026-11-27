import { setGlobalOptions } from "firebase-functions";
import { initializeFirebase } from "./firebase-init";
import { syncRoutines as createSyncRoutines } from "./sync";
import { cleanupNotifications as createCleanupNotifications } from "./notificationCleanup";
import { onBugReportCreated as createOnBugReportCreated } from "./bugReport/onBugReportCreated";
import { agentApi as createAgentApi } from "./agentApi/agentApi";

const db = initializeFirebase();

setGlobalOptions({ maxInstances: 10 });

// 各関数をエクスポート
export const syncRoutines = createSyncRoutines(db);
// checkNotifications はプッシュ通知未使用のため未エクスポート（Scheduler 停止済み）
export const cleanupNotifications = createCleanupNotifications(db);
export const onBugReportCreated = createOnBugReportCreated(db);
export const agentApi = createAgentApi(db);
// 画像系関数は Storage バケット未整備のため未エクスポート（デプロイ時のリージョン解決失敗を避ける）
