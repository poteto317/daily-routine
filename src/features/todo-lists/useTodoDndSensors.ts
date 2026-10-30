import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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

/** Todoのアイテム・カテゴリの並び替えで共通のdnd-kitセンサーを返す。 */
export const useTodoDndSensors = () =>
  useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );
