/**
 * ルーティン/テンプレートの同一性を判定するキーを生成する。
 * title・startTimeが一致するものを「同じ内容」とみなす基準を1箇所に集約する。
 */
export const buildRoutineIdentityKey = (
  title: string,
  startTime: string,
): string => JSON.stringify([title, startTime]);
