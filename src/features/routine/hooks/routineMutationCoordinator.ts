import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";

export type SetRoutines = Dispatch<SetStateAction<Routine[]>>;
export type SaveAndSyncAction = (updated: Routine[]) => void;
export type RoutineMutation = (previous: Routine[]) => Routine[];
export type RunAndSync = (mutate: RoutineMutation) => void;

/**
 * mutation を実行して setRoutines と saveAndSync を呼ぶ runner を生成する。
 *
 * saveAndSync を setRoutines の関数型 updater 内で呼ぶと、React の render フェーズ中に
 * イベントが dispatch され "Cannot update a component while rendering" エラーが発生する。
 * routinesRef.current でレンダー外から最新ルーティンを取得し、updater を使わずに直接更新することで
 * この問題を回避している。
 *
 * また、runner 内で routinesRef.current = updated を即座に反映することで、
 * 同一 tick 内で runner が複数回呼ばれた場合も後続の呼び出しが最新値を参照できる。
 */
export const createRoutineMutationRunner = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
  routinesRef: { current: Routine[] },
): RunAndSync => {
  return (mutate) => {
    const updated = mutate(routinesRef.current);
    routinesRef.current = updated;
    setRoutines(updated);
    saveAndSync(updated);
  };
};
