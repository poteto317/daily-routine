"use client";

import { RoutineEmptyState } from "./RoutineEmptyState";
import { DraggableRoutineList } from "./DraggableRoutineList";
import type { HomeRoutineListProps as RoutineListProps } from "./homeTypes";

/** ルーティン一覧コンポーネント */
export const RoutineList = ({
  sortedRoutines,
  allRoutinesCount,
  displayRoutinesCount,
  isEditMode,
  onToggleAction,
  onEditAction,
  onDeleteAction,
  onAddRoutineAction,
  onReorderAction,
  viewMode,
}: RoutineListProps) => {
  if (displayRoutinesCount === 0 || sortedRoutines.length === 0) {
    return (
      <RoutineEmptyState
        allRoutinesCount={allRoutinesCount}
        displayRoutinesCount={displayRoutinesCount}
        filteredRoutinesCount={sortedRoutines.length}
        isEditMode={isEditMode}
        onAddRoutineAction={onAddRoutineAction}
        viewMode={viewMode}
      />
    );
  }

  // 通常モード・編集モードともに DraggableRoutineList を使用する。
  // 通常モードではロングプレス（300ms）でドラッグ並び替えが開始される。
  return (
    <DraggableRoutineList
      routines={sortedRoutines}
      isEditMode={isEditMode}
      onToggleAction={onToggleAction}
      onEditAction={onEditAction}
      onDeleteAction={onDeleteAction}
      onReorderAction={onReorderAction}
    />
  );
};
