type Point = { x: number; y: number };

/**
 * 開始位置から現在位置までのユークリッド距離がtoleranceを超えたかを判定する。
 * 長押し中のスクロール等による誤操作防止（キャンセル判定）に使う。
 */
export const hasExceededMoveTolerance = (
  start: Point,
  current: Point,
  tolerance: number,
): boolean => {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  return Math.sqrt(dx * dx + dy * dy) > tolerance;
};
