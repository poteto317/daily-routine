"use client";

import { type Routine } from "@/types/routine";
import { getSettings } from "@/features/settings/storage";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import { useCurrentMinute } from "@/hooks/useCurrentMinute";
import { RoutineCardContent } from "./RoutineCardContent";
import { SortableRoutineEditModeItem } from "./SortableRoutineEditModeItem";
import {
  createRoutineItemHandlers,
  getRoutineItemCardClassName,
} from "./routineItemModel";
import { shouldUseSwipeOnlyRoutineItem } from "./routineItemPresentation";

interface SortableRoutineItemProps {
  routine: Routine;
  onToggle: (id: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  isEditMode?: boolean;
}

/**
 * ソート可能なルーティンアイテムコンポーネント
 * dnd-kitを使用したドラッグ&ドロップによる並び替えをサポート
 * 編集モード時はドラッグハンドル表示、表示モード時は通常のタップアクション
 * @param {Object} props - コンポーネントのprops
 * @param {Routine} props.routine - 表示するルーティン
 * @param {Function} props.onToggle - 完了状態トグルコールバック
 * @param {Function} props.onEdit - 編集ボタンクリックコールバック
 * @param {Function} props.onDelete - 削除ボタンクリックコールバック
 * @param {boolean} [props.isEditMode=true] - 編集モードフラグ
 * @returns {JSX.Element}
 */
export const SortableRoutineItem = ({
  routine,
  onToggle,
  onEdit,
  onDelete,
  isEditMode = true,
}: SortableRoutineItemProps) => {
  const nowMinute = useCurrentMinute();
  const settings = getSettings();
  const {
    handleCardClick,
    handleEditClick,
    handleDeleteClick,
    handleSwipeAction,
  } = createRoutineItemHandlers(
    routine,
    {
      onToggle,
      onEdit,
      onDelete,
    },
    isEditMode,
  );

  // 編集モードでない時は通常のコンポーネントを返す
  if (shouldUseSwipeOnlyRoutineItem(isEditMode)) {
    return (
      <SwipeableRoutineItem
        onSwipeAction={() => handleSwipeAction(routine)}
        swipeActionType={settings.swipeAction}
        isEditMode={false}
      >
        <div
          onClick={handleCardClick}
          className={getRoutineItemCardClassName({
            routine,
            isEditMode,
            isDraggable: false,
            nowMinute,
          })}
        >
          <RoutineCardContent routine={routine} showDuration />
        </div>
      </SwipeableRoutineItem>
    );
  }

  // 編集モードの時はドラッグ可能なコンポーネント
  return (
    <SortableRoutineEditModeItem
      routine={routine}
      onEditAction={handleEditClick}
      onDeleteAction={handleDeleteClick}
      onSwipeAction={() => handleSwipeAction(routine)}
      swipeActionType={settings.swipeAction}
    />
  );
};
