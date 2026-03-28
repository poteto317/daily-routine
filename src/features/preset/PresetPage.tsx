/**
 * プリセット管理ページ
 */

"use client";

import { useRoutines } from "@/features/routine";
import { PresetManager } from "./PresetManager";

export const PresetPage = () => {
  const { routines, replaceRoutinesForDays } = useRoutines();

  const handleApplyPreset = (
    newRoutines: Parameters<typeof replaceRoutinesForDays>[1],
    targetDays: number[],
  ) => {
    replaceRoutinesForDays(targetDays, newRoutines);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <PresetManager
        currentRoutines={routines}
        onApplyPreset={handleApplyPreset}
      />
    </div>
  );
};
