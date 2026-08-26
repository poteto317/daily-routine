import { useCallback, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { Routine } from "@/types/routine";
import { reorderRoutinesWithOriginalTimes } from "./draggableRoutineListHelpers";

type Params = {
  routines: Routine[];
  onReorderAction: (
    reorderedRoutines: Routine[],
    sourceRoutines: Routine[],
  ) => void;
};

type RoutineDragState = {
  activeId: string | null;
  activeRoutine: Routine | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
};

/**
 * ルーティンリストのドラッグ状態と操作を管理するフック
 * DraggableRoutineList からドラッグ状態管理を分離する
 */
export const useRoutineDragState = ({
  routines,
  onReorderAction,
}: Params): RoutineDragState => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragSourceRoutinesRef = useRef<Routine[] | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      dragSourceRoutinesRef.current = routines;
      setActiveId(String(event.active.id));
    },
    [routines],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const sourceRoutines = dragSourceRoutinesRef.current ?? routines;
      dragSourceRoutinesRef.current = null;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const reordered = reorderRoutinesWithOriginalTimes(
        sourceRoutines,
        String(active.id),
        String(over.id),
      );

      if (!reordered) return;

      onReorderAction(reordered, sourceRoutines);
    },
    [routines, onReorderAction],
  );

  const handleDragCancel = useCallback(() => {
    dragSourceRoutinesRef.current = null;
    setActiveId(null);
  }, []);

  const activeRoutine = activeId
    ? (routines.find((r) => r.id === activeId) ?? null)
    : null;

  return {
    activeId,
    activeRoutine,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
