let currentUserId: string | null = null;

const USER_DATA_KEYS = [
  "daily-routines",
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

export const getUserScopedKey = (key: string): string => {
  return currentUserId ? `user:${currentUserId}:${key}` : key;
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
      localStorage.setItem(scopedKey, oldData);
    }
  }

  localStorage.setItem(migrationKey, "true");
};
