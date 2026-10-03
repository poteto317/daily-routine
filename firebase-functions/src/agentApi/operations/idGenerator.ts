/** アプリ側 generateId（src/lib/storage/core-modules/formatters.ts）と同じ形式 */
export const generateId = (prefix: string, now: Date): string =>
  `${prefix}-${now.getTime()}-${Math.random().toString(36).slice(2, 11)}`;
