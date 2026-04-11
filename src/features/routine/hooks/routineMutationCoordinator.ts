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
 * getRoutines() でレンダー外から最新ルーティンを取得し、updater を使わずに直接更新することで
 * この問題を回避している。
 */
export const createRoutineMutationRunner = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
  getRoutines: () => Routine[],
): RunAndSync => {
  return (mutate) => {
    const updated = mutate(getRoutines());
    setRoutines(updated);
    saveAndSync(updated);
  };
};
