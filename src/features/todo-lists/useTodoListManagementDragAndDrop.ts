import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { useTodoDndSensors } from "./useTodoDndSensors";

type UseTodoListManagementDragAndDropParams = {
  onReorderLists: (activeListId: string, overListId: string) => void;
};

/**
 * Todoリスト管理画面の DnD のセンサーと onDragEnd を返す。
 * 表示順（menuOrder で並べた順）と配列の順が違うため、添字ではなく
 * リストの ID をそのまま渡し、位置は並び替えの関数の中で求め直す。
 * ドラッグ中の見た目は行の useSortable の isDragging で足りるので、
 * activeId は持たない。
 */
export const useTodoListManagementDragAndDrop = ({
  onReorderLists,
}: UseTodoListManagementDragAndDropParams) => {
  const sensors = useTodoDndSensors();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeListId = String(active.id);
      const overListId = String(over.id);
      if (activeListId === overListId) return;

      onReorderLists(activeListId, overListId);
    },
    [onReorderLists],
  );

  return { sensors, handleDragEnd };
};
