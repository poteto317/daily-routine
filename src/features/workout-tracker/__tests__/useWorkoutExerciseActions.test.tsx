import { act, renderHook } from "@testing-library/react";
import { useWorkoutExerciseActions } from "../page/useWorkoutExerciseActions";
import { addWorkoutExercise } from "../storage";
jest.mock("../storage", () => ({
  addWorkoutExercise: jest.fn(),
  renameWorkoutExercise: jest.fn(),
  deleteWorkoutExercise: jest.fn(),
}));
it("失敗をReactのstateへ反映し、再レンダー後の種別で成功するとエラーを解除する", () => {
  const select = jest.fn();
  const reload = jest.fn();
  jest.mocked(addWorkoutExercise).mockImplementationOnce(() => {
    throw new Error("保存失敗");
  });
  const { result, rerender } = renderHook(
    ({ label }: { label: "strength" | "running" }) =>
      useWorkoutExerciseActions({ label, selectedId: "", select, reload }),
    { initialProps: { label: "strength" } },
  );
  act(() => {
    expect(result.current.add("ベンチ")).toBe(false);
  });
  expect(result.current.error).toBe("保存失敗");
  rerender({ label: "running" });
  jest.mocked(addWorkoutExercise).mockReturnValue({
    id: "r",
    name: "ラン",
    label: "running",
    createdAt: "",
    updatedAt: "",
  });
  act(() => {
    expect(result.current.add("ラン")).toBe(true);
  });
  expect(addWorkoutExercise).toHaveBeenLastCalledWith({
    name: "ラン",
    label: "running",
  });
  expect(result.current.error).toBeNull();
  expect(select).toHaveBeenCalledWith("r");
});
