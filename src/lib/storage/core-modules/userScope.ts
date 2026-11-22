let currentUserId: string | null = null;

const ROUTINES_KEY = "daily-routines";
const COPIED_ROUTINES_KEY = "_legacy-routines-copy";

const USER_DATA_KEYS = [
  ROUTINES_KEY,
  "daily-progress",
  "daily-history",
  "app-settings",
  "pomodoro-history",
  "work-sessions",
  "work-templates",
  "budget-data",
  "meal-history",
  "journal-history",
  "weight-history",
  "routine-presets",
];

export const setCurrentUserId = (uid: string | null): void => {
  currentUserId = uid;
};

export const getCurrentUserId = (): string | null => {
  return currentUserId;
};

export const getUserScopedKey = (key: string, uid = currentUserId): string =>
  uid ? `user:${uid}:${key}` : key;

/** 旧版から継承した可能性があるルーティンを起動時の通知同期から除く。 */
export const wasLegacyRoutineStorageCopied = (uid: string): boolean => {
  const marker = getUserScopedKey(COPIED_ROUTINES_KEY, uid);
  if (localStorage.getItem(marker)) return true;

  const legacy = localStorage.getItem(ROUTINES_KEY);
  if (
    legacy === null ||
    legacy !== localStorage.getItem(getUserScopedKey(ROUTINES_KEY, uid))
  ) {
    return false;
  }
  // 旧版で既にコピーされていた場合も、以降の起動で使わないように記録する。
  localStorage.setItem(marker, "true");
  return true;
};

export const migrateToUserStorage = (uid: string): void => {
  if (typeof window === "undefined") return;

  const migrationKey = `user:${uid}:_migrated`;
  if (localStorage.getItem(migrationKey)) return;

  for (const key of USER_DATA_KEYS) {
    const scopedKey = `user:${uid}:${key}`;
    const existingScoped = localStorage.getItem(scopedKey);
    if (existingScoped) continue;

    const oldData = localStorage.getItem(key);
    if (oldData) {
      if (key === ROUTINES_KEY) {
        localStorage.setItem(
          getUserScopedKey(COPIED_ROUTINES_KEY, uid),
          "true",
        );
      }
      localStorage.setItem(scopedKey, oldData);
    }
  }

  localStorage.setItem(migrationKey, "true");
};
