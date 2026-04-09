import { useEffect, useRef } from "react";
import type { Routine } from "@/types/routine";

/**
 * routines 配列の変化を検知して最終更新時刻を ref に記録するフック
 *
 * routines が変わるたびに lastUpdateAtRef.current が現在時刻で上書きされる。
 * ref オブジェクト自体は安定した参照なので依存配列に含めても害がない。
 */
export const useRoutineLastUpdateTracker = (
  routines: Routine[],
): React.RefObject<number> => {
  const lastUpdateAtRef = useRef<number>(0);

  useEffect(() => {
    lastUpdateAtRef.current = Date.now();
  }, [routines]);

  return lastUpdateAtRef;
};
