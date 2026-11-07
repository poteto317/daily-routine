import { useState } from "react";
import { getTodayString } from "@/lib/storage/core";
import { getWeeklyLogWeekStart, shiftWeeklyLogWeek } from "./weeklyLogWeek";

export type WeeklyLogWeekNavigation = {
  selectedWeekStart: string;
  canNavigate: boolean;
  canGoNext: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  openWeek: (weekStart: string) => void;
  /** ロックを無視して週を選ぶ（保存直後など、フォームを閉じる操作と同時に使う） */
  selectWeek: (weekStart: string) => void;
};

/**
 * 呼ばれた時点の今週の開始日。ハンドラの中で使う（描画から時間が経つと、描画時の今週は古い）。
 * 描画の本体では呼ばない（React Compiler で最初の描画の値に固定されるため）
 */
const getLatestWeekStart = () => getWeeklyLogWeekStart(getTodayString());

/**
 * 表示する週の選択。isLocked の間は動かさず、今週より先へは進めない。
 * 明示的に選んだ週（前後の移動・openWeek・保存後の selectWeek）は日をまたいでも保つ。
 * 何も選んでいない間、または選んだ週が今週のときは、今週に追いつく
 */
export const useWeeklyLogWeekNavigation = (
  currentWeekStart: string,
  isLocked: boolean,
): WeeklyLogWeekNavigation => {
  const [explicitWeekStart, setExplicitWeekStart] = useState<string | null>(
    null,
  );
  const selectedWeekStart = explicitWeekStart ?? currentWeekStart;

  const canNavigate = !isLocked;
  const canGoNext = canNavigate && selectedWeekStart < currentWeekStart;

  // 今週を選んだ場合は固定せず、日をまたいだら新しい今週に追いつく
  // 今週かどうかは描画時ではなく、呼ばれた時点の今日で判定する
  const selectWeek = (weekStart: string) => {
    setExplicitWeekStart(weekStart === getLatestWeekStart() ? null : weekStart);
  };

  const goToPreviousWeek = () => {
    if (!canNavigate) return;
    selectWeek(shiftWeeklyLogWeek(selectedWeekStart, -1));
  };

  const goToNextWeek = () => {
    if (!canNavigate || selectedWeekStart >= getLatestWeekStart()) return;
    selectWeek(shiftWeeklyLogWeek(selectedWeekStart, 1));
  };

  const openWeek = (weekStart: string) => {
    if (!canNavigate) return;
    selectWeek(weekStart);
  };

  return {
    selectedWeekStart,
    canNavigate,
    canGoNext,
    goToPreviousWeek,
    goToNextWeek,
    openWeek,
    selectWeek,
  };
};
