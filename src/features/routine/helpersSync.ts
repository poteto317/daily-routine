import type { Auth, User } from "firebase/auth";
import { type Routine } from "@/types/routine";
import { hasNotificationPermission } from "@/features/notification";
import { deleteFCMToken, getAuthInstance, getFCMToken } from "@/lib/firebase";
import { getCurrentUserId } from "@/lib/storage/core";

import {
  postNotificationRoutines,
  syncEndpoint,
  type NotificationRoutine,
} from "./notificationSyncTransport";

const toNotificationRoutines = (routines: Routine[]): NotificationRoutine[] =>
  routines.map(({ id, title, startTime, daysOfWeek, notificationMinutes }) => ({
    id,
    title,
    startTime,
    daysOfWeek: [...daysOfWeek],
    notificationMinutes,
  }));

const isCurrentOwner = (auth: Auth, owner: User): boolean =>
  auth.currentUser === owner && getCurrentUserId() === owner.uid;

const syncForOwner = async (
  auth: Auth,
  owner: User,
  endpoint: string,
  routines: NotificationRoutine[],
): Promise<boolean> => {
  if (!isCurrentOwner(auth, owner)) return false;

  const token = await getFCMToken();
  if (!token || !isCurrentOwner(auth, owner)) return false;
  const idToken = await owner.getIdToken();
  if (!idToken || !isCurrentOwner(auth, owner)) return false;

  const result = await postNotificationRoutines(
    endpoint,
    idToken,
    token,
    routines,
  );
  if (result !== "owner-mismatch") return result;
  if (!isCurrentOwner(auth, owner)) return false;

  let replacement = await getFCMToken();
  if (!isCurrentOwner(auth, owner)) return false;
  if (replacement === token) {
    if (!(await deleteFCMToken()) || !isCurrentOwner(auth, owner)) return false;
    replacement = await getFCMToken();
  }
  if (!replacement || replacement === token || !isCurrentOwner(auth, owner)) {
    return false;
  }

  return (
    (await postNotificationRoutines(
      endpoint,
      idToken,
      replacement,
      routines,
    )) === true
  );
};

// 起動時の再登録と、その直後に編集した設定を同じページから送る順序を保つ。
let syncQueue = Promise.resolve(false);

export const syncRoutinesToFirebase = async (
  routines: Routine[],
  functionsUrl?: string,
  ownerUid = getCurrentUserId(),
): Promise<boolean> => {
  const url = functionsUrl || process.env.NEXT_PUBLIC_FUNCTIONS_URL;
  if (!url || !ownerUid || !hasNotificationPermission()) return false;

  try {
    const endpoint = syncEndpoint(url);
    const auth = getAuthInstance();
    const owner = auth.currentUser;
    if (!endpoint || !owner || owner.uid !== ownerUid) return false;

    const notificationRoutines = toNotificationRoutines(routines);
    syncQueue = syncQueue
      .then(() => syncForOwner(auth, owner, endpoint, notificationRoutines))
      .catch(() => false);
    return await syncQueue;
  } catch {
    return false;
  }
};
