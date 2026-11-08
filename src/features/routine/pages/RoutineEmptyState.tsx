"use client";

import {
  ROUTINE_EMPTY_STATE_TEXT,
  getAddButtonLabel,
  getEmptyMessage,
} from "./routineEmptyStatePresentation";

interface RoutineEmptyStateProps {
  allRoutinesCount: number;
  displayRoutinesCount: number;
  filteredRoutinesCount: number;
  isEditMode: boolean;
  onAddRoutineAction: () => void;
  viewMode: "holiday" | number;
}

/** ルーティンが空の場合の表示 */
export const RoutineEmptyState = ({
  allRoutinesCount,
  displayRoutinesCount,
  filteredRoutinesCount,
  isEditMode,
  onAddRoutineAction,
  viewMode,
}: RoutineEmptyStateProps) => {
  if (displayRoutinesCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-100 rounded-xl shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-600 mb-4">
          {getEmptyMessage(allRoutinesCount, viewMode)}
        </p>
        {isEditMode && (
          <button
            onClick={onAddRoutineAction}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {getAddButtonLabel(allRoutinesCount)}
          </button>
        )}
      </div>
    );
  }

  if (filteredRoutinesCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-100 rounded-xl shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-600">
          {ROUTINE_EMPTY_STATE_TEXT.noCategoryRoutines}
        </p>
      </div>
    );
  }

  return null;
};
