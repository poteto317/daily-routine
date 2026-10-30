import { renderHook } from "@testing-library/react";
import { KeyboardSensor, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTodoDndSensors } from "../useTodoDndSensors";

describe("useTodoDndSensors", () => {
  it("Pointer・Touch・Keyboard の順にセンサーを返す", () => {
    const { result } = renderHook(() => useTodoDndSensors());

    expect(result.current.map((descriptor) => descriptor.sensor)).toEqual([
      PointerSensor,
      TouchSensor,
      KeyboardSensor,
    ]);
  });

  it("センサーの設定値が distance 8・delay 300・tolerance 5 になる", () => {
    const { result } = renderHook(() => useTodoDndSensors());

    expect(result.current.map((descriptor) => descriptor.options)).toEqual([
      { activationConstraint: { distance: 8 } },
      { activationConstraint: { delay: 300, tolerance: 5 } },
      { coordinateGetter: sortableKeyboardCoordinates },
    ]);
  });

  it("再描画しても options の参照が変わらない", () => {
    const { result, rerender } = renderHook(() => useTodoDndSensors());
    const firstOptions = result.current.map((d) => d.options);

    rerender();

    result.current.forEach((descriptor, index) => {
      expect(descriptor.options).toBe(firstOptions[index]);
    });
  });
});
