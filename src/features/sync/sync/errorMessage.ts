export const getSyncErrorMessage = (error: unknown, fallback: string): string =>
  (error instanceof Error ? error.message : fallback)
    .replace(/firebase/gi, "")
    .replace(/FCM/g, "")
    .replace(/firestore/gi, "データベース")
    .trim();
