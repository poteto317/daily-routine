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
import type { TodoListItem } from "./types";

type UseTodoListDragAndDropParams = {
  items: TodoListItem[];
  listId: string;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  /** ドラッグ開始時に呼ばれるコールバック（例: インライン挿入フォームを閉じる） */
  onDragStarted?: () => void;
};

/**
 * TodoリストのDnD（ドラッグアンドドロップ）状態とイベントハンドラーを管理するフック。
 * - アクティブなドラッグアイテムの追跡
 * - dnd-kit センサーの設定
 * - dragStart / dragEnd / dragCancel ハンドラー
 */
export const useTodoListDragAndDrop = ({
  items,
  listId,
  onReorderItems,
  onDragStarted,
}: UseTodoListDragAndDropParams) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(String(event.active.id));
      onDragStarted?.();
    },
    [onDragStarted],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = items.findIndex((i) => i.id === active.id);
      const toIndex = items.findIndex((i) => i.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      onReorderItems(listId, fromIndex, toIndex);
    },
    [items, listId, onReorderItems],
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
