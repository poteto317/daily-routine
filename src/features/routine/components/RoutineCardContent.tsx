"use client";

import { type Routine } from "@/types/routine";
import { isValidWeeklyGoal } from "@/lib/weeklyGoal";
import { getCategoryInfo } from "../helpers";
import {
  getDurationLabel,
  getNotificationLabel,
  getRoutineTitleClassName,
  getWeeklyGoalLabel,
} from "./helpers";

interface RoutineCardContentProps {
  routine: Routine;
  showDuration?: boolean;
}

/**
 * ルーティンカードの内容表示コンポーネント
 * RoutineItemとSortableRoutineItemで共通利用される表示部分
 * 時刻、カテゴリバッジ、タイトル、所要時間を表示
 * @param {Object} props - コンポーネントのprops
 * @param {Routine} props.routine - 表示するルーティン
 * @param {boolean} [props.showDuration=false] - 所要時間を表示するかどうか
 * @returns {JSX.Element}
 */
export const RoutineCardContent = ({
  routine,
  showDuration = false,
}: RoutineCardContentProps) => {
  const categoryInfo = getCategoryInfo(routine);
  const titleClassName = getRoutineTitleClassName(routine, showDuration);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-700 shrink-0">
          {routine.startTime}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${categoryInfo.color}`}
        >
          {categoryInfo.emoji} {categoryInfo.label}
        </span>
        {isValidWeeklyGoal(routine.weeklyGoal) && (
          <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-800">
            {getWeeklyGoalLabel(routine.weeklyGoal.targetPerWeek)}
          </span>
        )}
        {!showDuration && <h3 className={titleClassName}>{routine.title}</h3>}
      </div>
      {showDuration && <h3 className={titleClassName}>{routine.title}</h3>}
      {routine.description && (
        <p className="text-sm text-gray-600 dark:text-gray-700 mt-1 wrap-break-word">
          {routine.description}
        </p>
      )}
      {showDuration ? (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-600">
          <span>{getDurationLabel(routine.duration)}</span>
          {routine.notificationMinutes && (
            <span>{getNotificationLabel(routine.notificationMinutes)}</span>
          )}
        </div>
      ) : (
        routine.notificationMinutes && (
          <p className="text-xs text-gray-500 dark:text-gray-700 mt-1">
            {getNotificationLabel(routine.notificationMinutes)}
          </p>
        )
      )}
    </div>
  );
};
