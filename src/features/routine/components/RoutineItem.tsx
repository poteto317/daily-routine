"use client";

import { type Routine } from "@/types/routine";
import { getSettings } from "@/features/settings/storage";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import { RoutineCardContent } from "./RoutineCardContent";
import {
  createRoutineItemHandlers,
  getRoutineItemCardClassName,
} from "./routineItemModel";
import {
  ROUTINE_ITEM_DELETE_LABEL,
  ROUTINE_ITEM_EDIT_LABEL,
} from "./routineItemPresentation";

interface RoutineItemProps {
  routine: Routine;
  onToggle: (id: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  isEditMode?: boolean;
}

/**
 * ルーティンアイテムコンポーネント
 * ドラッグ&ドロップ不要の場合に使用する軽量版ルーティン表示コンポーネント
 * スワイプアクション、完了トグル、編集・削除ボタンをサポート
 * @param {Object} props - コンポーネントのprops
 * @param {Routine} props.routine - 表示するルーティン
 * @param {Function} props.onToggle - 完了状態トグルコールバック
 * @param {Function} props.onEdit - 編集ボタンクリックコールバック
 * @param {Function} props.onDelete - 削除ボタンクリックコールバック
 * @param {boolean} [props.isEditMode=true] - 編集モードフラグ
 * @returns {JSX.Element}
 */
export const RoutineItem = ({
  routine,
  onToggle,
  onEdit,
  onDelete,
  isEditMode = true,
}: RoutineItemProps) => {
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

  const cardContent = (
    <div
      onClick={handleCardClick}
      className={`${getRoutineItemCardClassName({
        routine,
        isEditMode,
        isDraggable: false,
      })} flex-col sm:flex-row sm:items-center`}
    >
      <RoutineCardContent routine={routine} />

      {isEditMode && (
        <div
          className="flex gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditClick}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:text-blue-700 dark:hover:bg-blue-200 rounded transition-colors"
          >
            {ROUTINE_ITEM_EDIT_LABEL}
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 dark:text-red-700 dark:hover:bg-red-200 rounded transition-colors"
          >
            {ROUTINE_ITEM_DELETE_LABEL}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <SwipeableRoutineItem
      onSwipeAction={() => handleSwipeAction(routine)}
      swipeActionType={settings.swipeAction}
      isEditMode={isEditMode}
    >
      {cardContent}
    </SwipeableRoutineItem>
  );
};
