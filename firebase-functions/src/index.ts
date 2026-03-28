import { setGlobalOptions } from "firebase-functions";
import { initializeFirebase } from "./firebase-init";
import { syncRoutines as createSyncRoutines } from "./sync";
import { checkNotifications as createCheckNotifications } from "./notifications";
import { cleanupNotifications as createCleanupNotifications } from "./notificationCleanup";

const db = initializeFirebase();

setGlobalOptions({ maxInstances: 10 });

// 各関数をエクスポート
export const syncRoutines = createSyncRoutines(db);
export const checkNotifications = createCheckNotifications(db);
export const cleanupNotifications = createCleanupNotifications(db);
