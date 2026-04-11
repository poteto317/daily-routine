import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";
import {
  getDailyProgress,
  saveDailyProgress,
} from "@/features/routine/storage";
import {
  buildDailyProgressForToggle,
  toggleRoutineCompletionInState,
} from "./routineCompletionActions";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

/**
 * ルーティンの完了状態を切り替え、デイリー進捗を保存する。
 *
 * saveDailyProgress を setRoutines の関数型 updater 内で呼ぶと、React の render フェーズ中に
 * イベントが dispatch され "Cannot update a component while rendering" エラーが発生する。
 * getRoutines() で最新ルーティンを取得し、updater を使わず直接更新することで回避している。
 */
export const useRoutineCompletionToggleMutation = (
  setRoutines: SetRoutines,
  getRoutines: () => Routine[],
) => {
  return useCallback(
    (id: string) => {
      const updated = toggleRoutineCompletionInState(getRoutines(), id);
      setRoutines(updated);
      saveDailyProgress(
        buildDailyProgressForToggle(updated, getTodayString(), getDailyProgress()),
      );
    },
    [setRoutines, getRoutines],
  );
};
