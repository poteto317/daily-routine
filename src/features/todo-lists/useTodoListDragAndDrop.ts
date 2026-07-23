import { useCallback, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { TodoListItem } from "./types";

const EMPTY_SENSORS: SensorDescriptor<SensorOptions>[] = [];

// dnd-kitのuseSensorは渡されたoptionsオブジェクトの参照が変わるたびに
// 内部メモを再計算する。インラインリテラルのままだと毎レンダー新しい
// 参照になりメモ化が効かないため、モジュールスコープの定数として固定する。
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 300, tolerance: 5 },
};
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates,
};

type UseTodoListDragAndDropParams = {
  items: TodoListItem[];
  listId: string;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  /** ドラッグ開始時に呼ばれるコールバック（例: インライン挿入フォームを閉じる） */
  onDragStarted?: () => void;
  /** true のとき DnD を完全に無効化する（ソートビュー中など表示順と data 順が乖離している場合に使用） */
  disabled?: boolean;
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
  disabled = false,
}: UseTodoListDragAndDropParams) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const registeredSensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
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
      if (!over) return;
      const activeStrId = String(active.id);
      const overStrId = String(over.id);
      if (activeStrId === overStrId) return;

      const fromIndex = items.findIndex((i) => i.id === activeStrId);
      const toIndex = items.findIndex((i) => i.id === overStrId);
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
    sensors: disabled ? EMPTY_SENSORS : registeredSensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
