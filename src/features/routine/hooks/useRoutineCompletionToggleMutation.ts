import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";
import {
  getDailyProgress,
  saveDailyProgress,
} from "@/features/routine/storage";
import { toggleRoutineCompletionInState } from "./routineCompletionState";
import { buildDailyProgressFromRoutines } from "./routineStateProgressModel";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

/**
 * ルーティンの完了状態を切り替え、デイリー進捗を保存する。
 *
 * saveDailyProgress を setRoutines の関数型 updater 内で呼ぶと、React の render フェーズ中に
 * イベントが dispatch され "Cannot update a component while rendering" エラーが発生する。
 * routinesRef.current で最新ルーティンを取得し、updater を使わず直接更新することで回避している。
 * また、routinesRef.current = updated を即座に反映することで連続呼び出し時も最新値を参照できる。
 */
export const useRoutineCompletionToggleMutation = (
  setRoutines: SetRoutines,
  routinesRef: { current: Routine[] },
) => {
  return useCallback(
    (id: string) => {
      const updated = toggleRoutineCompletionInState(routinesRef.current, id);
      routinesRef.current = updated;
      setRoutines(updated);
      saveDailyProgress(
        buildDailyProgressFromRoutines(
          updated,
          getTodayString(),
          getDailyProgress(),
        ),
      );
    },
    [setRoutines, routinesRef],
  );
};
