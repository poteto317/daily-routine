/** lastModified を数値で読む（number / Firestore Timestamp 以外は 0） */
export const readLastModified = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
};

/** 次の lastModified。時計が巻き戻っていても既存値より必ず大きくする */
export const nextLastModified = (
  currentValue: unknown,
  nowMillis: number,
): number => Math.max(nowMillis, readLastModified(currentValue) + 1);
