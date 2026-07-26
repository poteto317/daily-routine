import { useCallback, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { TodoCategory } from "./types";

// useTodoListDragAndDrop.ts と同じ理由で、センサーoptionsはモジュール
// スコープの定数として固定する（参照の安定性を保ちメモ化を効かせるため）。
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 300, tolerance: 5 },
};
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates,
};

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

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );

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
