import { useMemo } from "react";
import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { useJstTodayKey } from "@/hooks/useToday";
import { calculateWeeklyGoalProgress } from "../statistics";
import type { WeeklyGoalProgress } from "../statistics/types";

type UseWeeklyGoalProgressOptions = {
  now?: () => Date;
};

export const useWeeklyGoalProgress = (
  selectedDate: Date,
  options: UseWeeklyGoalProgressOptions = {},
): WeeklyGoalProgress[] => {
  const now = options.now;
  // 今日は週の開始日（JST・月曜始まり）を求めるためだけに使うので、JST の今日のキーから
  // 作った 0 時の Date で足りる。キーを依存に入れ、日をまたいだ後の再描画で計算し直す。
  // +09:00 を付けるのは、週の開始日を JST で読むため、端末のタイムゾーンに依らず JST の日付を指させるため
  // （家計簿のフォームと違い、端末ローカルの 0 時にしない）
  const todayKey = useJstTodayKey();

  return useMemo(
    () =>
      calculateWeeklyGoalProgress({
        selectedDate,
        today: now ? now() : new Date(`${todayKey}T00:00:00+09:00`),
        routines: getRoutines(),
        history: getMonthlyHistory(),
      }),
    [selectedDate, now, todayKey],
  );
};
