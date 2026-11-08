"use client";

import type { WorkoutRecord } from "@/types/routine";
import texts from "../../locales/ja.json";
import { formatWorkoutRecordSummary } from "../../workoutRecordSummary";

type WorkoutRecordHistoryItemProps = {
  record: WorkoutRecord;
  onDeleteAction: (record: WorkoutRecord) => void;
};

/**
 * 運動記録1件の表示。ラベル（筋トレ/ランニング）に応じて項目を出し分ける。
 */
export const WorkoutRecordHistoryItem = ({
  record,
  onDeleteAction,
}: WorkoutRecordHistoryItemProps) => {
  const isStrength = record.label === "strength";

  return (
    <li className="flex items-center justify-between gap-2 p-3 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-500 rounded-xl">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {isStrength ? texts.form.labelStrength : texts.form.labelRunning}{" "}
          {record.exerciseName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-300">
          {formatWorkoutRecordSummary(record)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDeleteAction(record)}
        aria-label={texts.historyItem.deleteAriaLabel}
        className="shrink-0 text-gray-300 hover:text-red-400 dark:text-gray-400 dark:hover:text-red-400 transition-colors text-base leading-none"
      >
        🗑️
      </button>
    </li>
  );
};
