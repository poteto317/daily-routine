"use client";

import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRoutineItem } from "@/features/routine";
import { SortableRoutineNormalDragItem } from "@/features/routine/components/SortableRoutineNormalDragItem";
import { RoutineDragOverlay } from "@/features/routine/components/RoutineDragOverlay";
import { Routine } from "@/types/routine";
import { useRoutineDragState } from "./useRoutineDragState";

interface DraggableRoutineListProps {
  routines: Routine[];
  /** 編集モードのときtrue：ドラッグハンドル+編集・削除ボタンを表示 */
  isEditMode: boolean;
  onToggleAction: (id: string) => void;
  onEditAction: (routine: Routine) => void;
  onDeleteAction: (id: string) => void;
  onReorderAction: (routines: Routine[]) => void;
}

/**
 * ドラッグ&ドロップ対応ルーティンリスト
 * - 通常モード: ドラッグハンドル（⨿）をタップして並び替えを開始
 * - 編集モード: ドラッグハンドル付き、編集・削除ボタンを表示
 */
export const DraggableRoutineList = ({
  routines,
  isEditMode,
  onToggleAction,
  onEditAction,
  onDeleteAction,
  onReorderAction,
}: DraggableRoutineListProps) => {
  const {
    activeId,
    activeRoutine,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useRoutineDragState({ routines, onReorderAction });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      // ドラッグハンドルからの操作のため、ロングプレス遅延は不要。
      // distance ベース（5px）で即座にドラッグ開始する。
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={routines.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {routines.map((routine) =>
            isEditMode ? (
              <SortableRoutineItem
                key={routine.id}
                routine={routine}
                onToggle={onToggleAction}
                onEdit={onEditAction}
                onDelete={onDeleteAction}
                isEditMode={true}
              />
            ) : (
              <SortableRoutineNormalDragItem
                key={routine.id}
                routine={routine}
                onToggleAction={onToggleAction}
                isDragActive={activeId !== null}
              />
            ),
          )}
        </div>
      </SortableContext>

      {/* ドラッグ中に動くゴースト要素 */}
      <DragOverlay>
        <RoutineDragOverlay routine={activeRoutine} />
      </DragOverlay>
    </DndContext>
  );
};
