import { useEffect, useRef, type MutableRefObject } from "react";
import type { Routine } from "@/types/routine";

/**
 * routines の要素参照を shallow 比較して実データの変化を検出する。
 *
 * refreshRoutineState が日付未変更時に返す [...previous] のような
 * 「配列参照のみ新しい・要素は全て同一」ケースを変化なしと判定する。
 */
const hasElementChange = (prev: Routine[], next: Routine[]): boolean => {
  if (prev.length !== next.length) return true;
  return next.some((r, i) => r !== prev[i]);
};

/**
 * routines 配列の実データ変化を検知して最終更新時刻を ref に記録するフック
 *
 * - 要素参照が全て同一の配列コピー（[...previous] 相当）は変化とみなさない
 * - ref オブジェクト自体は安定した参照なので依存配列に含めても害がない
 */
export const useRoutineLastUpdateTracker = (
  routines: Routine[],
): MutableRefObject<number> => {
  const lastUpdateAtRef = useRef<number>(0);
  const prevRoutinesRef = useRef<Routine[]>([]);

  useEffect(() => {
    if (hasElementChange(prevRoutinesRef.current, routines)) {
      lastUpdateAtRef.current = Date.now();
    }
    prevRoutinesRef.current = routines;
  }, [routines]);

  return lastUpdateAtRef;
};
