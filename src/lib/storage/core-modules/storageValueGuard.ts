/**
 * localStorage / 同期経由の値はJSON.parseされるだけで型検証されないため、
 * defaultValueが示す形（配列 / プレーンオブジェクト）と一致しない値は
 * 不正データとみなす。呼び出し元がObject.entries()や.map()を行った際に
 * 例外を投げるのを防ぐ（この経路は同期のアップロード収集からも呼ばれるため、
 * 1件の不正データが同期全体を停止させうる）。
 *
 * defaultValueがnullやプリミティブの場合は期待する形が定まらないため検証しない。
 */
export const matchesDefaultShape = (
  value: unknown,
  defaultValue: unknown,
): boolean => {
  if (Array.isArray(defaultValue)) return Array.isArray(value);

  if (defaultValue !== null && typeof defaultValue === "object") {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  return true;
};

/**
 * defaultValueをそのまま返すと、呼び出し元がその値を変更した際に
 * モジュールレベルの共有定数（例: DEFAULT_MEAL_HISTORY）が汚染され、
 * 以降の取得結果に前回のデータが混入する。
 * （storageMutationsは取得結果へ直接pushする実装のため実際に起こりうる）
 *
 * localStorageへ入る値はJSON直列化可能なため、JSONのラウンドトリップで複製する。
 */
export const cloneDefaultValue = <T>(defaultValue: T): T => {
  if (defaultValue === null || typeof defaultValue !== "object") {
    return defaultValue;
  }

  return JSON.parse(JSON.stringify(defaultValue)) as T;
};

/**
 * 保存文字列をパースし、defaultValueの示す形と一致しない場合は
 * defaultValueへフォールバックする。
 */
export const parseStorageValue = <T>(
  data: string | null,
  defaultValue: T,
): T => {
  if (!data) return cloneDefaultValue(defaultValue);

  const parsed = JSON.parse(data);
  return matchesDefaultShape(parsed, defaultValue)
    ? parsed
    : cloneDefaultValue(defaultValue);
};
