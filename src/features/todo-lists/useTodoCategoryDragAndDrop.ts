import { useCallback, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { TodoCategory } from "./types";
import { useTodoDndSensors } from "./useTodoDndSensors";

type UseTodoCategoryDragAndDropParams = {
  categories: TodoCategory[];
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
};

/**
 * カテゴリ管理画面のDnD（ドラッグアンドドロップ）状態とイベントハンドラーを
 * 管理するフック。Todoアイテムの並び替え（useTodoListDragAndDrop.ts）と違い、
 * カテゴリには完了状態・親子ブロックのようなセクション制約がないため、
 * どのカテゴリ同士でも自由に並び替えを許可する（判定ロジックのラップは不要）。
 */
export const useTodoCategoryDragAndDrop = ({
  categories,
  onReorderCategories,
}: UseTodoCategoryDragAndDropParams) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useTodoDndSensors();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;
      const activeStrId = String(active.id);
      const overStrId = String(over.id);
      if (activeStrId === overStrId) return;

      const fromIndex = categories.findIndex((c) => c.id === activeStrId);
      const toIndex = categories.findIndex((c) => c.id === overStrId);
      if (fromIndex === -1 || toIndex === -1) return;

      onReorderCategories(fromIndex, toIndex);
    },
    [categories, onReorderCategories],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
