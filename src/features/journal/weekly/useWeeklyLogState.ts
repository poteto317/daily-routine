import { useState } from "react";
import type { WeeklyLogEntry, WeeklyLogHistory } from "@/types/routine";
import { useJstTodayKey } from "@/hooks/useToday";
import { listWeeklyLogsByLatest } from "./weeklyLogHistoryData";
import {
  deleteWeeklyLogAndReload,
  saveWeeklyLogAndReload,
} from "./weeklyLogActions";
import { getWeeklyLogHistory } from "./weeklyLogStorage";
import { getWeeklyLogWeekStart } from "./weeklyLogWeek";
import { useWeeklyLogForm } from "./useWeeklyLogForm";
import { useWeeklyLogWeekNavigation } from "./useWeeklyLogWeekNavigation";

export type WeeklyLogState = {
  currentWeekStart: string;
  selectedWeekStart: string;
  selectedEntry: WeeklyLogEntry | null;
  entries: WeeklyLogEntry[];
  isEditing: boolean;
  contentInput: string;
  canNavigate: boolean;
  canGoNext: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  openWeek: (weekStart: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  changeContent: (value: string) => void;
  save: () => void;
  remove: () => void;
};

export const useWeeklyLogState = (): WeeklyLogState => {
  // useJstTodayKey は描画のたびに今日を取り直す（React Compiler で固定されない）。
  // 開いたまま日をまたいでも、次の再描画で今週が追いつく
  const today = useJstTodayKey();
  const currentWeekStart = getWeeklyLogWeekStart(today);
  const [history, setHistory] = useState<WeeklyLogHistory>(() =>
    getWeeklyLogHistory(),
  );
  const form = useWeeklyLogForm();
  const navigation = useWeeklyLogWeekNavigation(
    currentWeekStart,
    form.isEditing,
  );
  // 書いている間はその週を保つ。閉じれば、選択は今週（または選んだ週）に戻る
  const selectedWeekStart =
    form.editingWeekStart ?? navigation.selectedWeekStart;

  const selectedEntry = history[selectedWeekStart] ?? null;

  const reload = () => setHistory(getWeeklyLogHistory());

  const startEditing = () => {
    form.open(navigation.selectedWeekStart, selectedEntry?.content ?? "");
  };

  const save = () => {
    const saved = saveWeeklyLogAndReload({
      weekStart: selectedWeekStart,
      content: form.contentInput,
      reloadData: reload,
      closeForm: form.close,
    });
    // 保存した週を表示する（今週なら追従のまま。判定は selectWeek に任せる）
    if (saved) navigation.selectWeek(selectedWeekStart);
  };

  const remove = () => {
    deleteWeeklyLogAndReload({
      weekStart: selectedWeekStart,
      reloadData: reload,
    });
  };

  return {
    currentWeekStart,
    selectedWeekStart,
    selectedEntry,
    entries: listWeeklyLogsByLatest(history),
    isEditing: form.isEditing,
    contentInput: form.contentInput,
    canNavigate: navigation.canNavigate,
    canGoNext: navigation.canGoNext,
    goToPreviousWeek: navigation.goToPreviousWeek,
    goToNextWeek: navigation.goToNextWeek,
    openWeek: navigation.openWeek,
    startEditing,
    cancelEditing: form.close,
    changeContent: form.changeContent,
    save,
    remove,
  };
};
