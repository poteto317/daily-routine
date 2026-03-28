"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRoutineItem } from "@/features/routine";
import { SortableRoutineNormalDragItem } from "@/features/routine/components/SortableRoutineNormalDragItem";
import { RoutineCardContent } from "@/features/routine/components/RoutineCardContent";
import { getRoutineItemCardClassName } from "@/features/routine/components/routineItemModel";
import { Routine } from "@/types/routine";
import { reorderRoutinesWithOriginalTimes } from "./draggableRoutineListHelpers";

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
 * - 通常モード: ロングプレス（300ms）でドラッグ並び替えを開始
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      // 300ms のロングプレスでドラッグ開始。5px 以内の動きは許容し、
      // 横スワイプ（5px 以上の素早い移動）はドラッグをキャンセルしてスクロール等に委ねる
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = reorderRoutinesWithOriginalTimes(
      routines,
      String(active.id),
      String(over.id),
    );

    if (!reordered) return;

    onReorderAction(reordered);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeRoutine = activeId
    ? routines.find((r) => r.id === activeId)
    : null;

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
        {activeRoutine ? (
          <div
            className={
              getRoutineItemCardClassName({
                routine: activeRoutine,
                isEditMode: false,
                isDraggable: false,
              }) + " shadow-xl opacity-95"
            }
          >
            <RoutineCardContent routine={activeRoutine} showDuration />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
