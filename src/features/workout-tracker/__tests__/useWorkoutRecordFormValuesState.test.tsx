import { act, renderHook } from "@testing-library/react";
import { getTodayString } from "@/lib/storage/core";
import { useWorkoutRecordFormValuesState } from "../page/useWorkoutRecordFormValuesState";

describe("useWorkoutRecordFormValuesState", () => {
  it("初期値はstrengthラベル・今日の日付・空の入力", () => {
    const { result } = renderHook(() => useWorkoutRecordFormValuesState());

    expect(result.current.values).toEqual({
      label: "strength",
      date: getTodayString(),
      exerciseId: "",
      weightKg: "",
      reps: "",
      sets: "",
      caloriesBurned: "",
    });
  });

  it("各setterで対応するフィールドのみ更新される", () => {
    const { result } = renderHook(() => useWorkoutRecordFormValuesState());

    act(() => result.current.setLabel("running"));
    expect(result.current.values.label).toBe("running");

    act(() => result.current.setExerciseId("ベンチプレス"));
    expect(result.current.values.exerciseId).toBe("ベンチプレス");

    act(() => result.current.setWeightKg("60"));
    expect(result.current.values.weightKg).toBe("60");

    act(() => result.current.setReps("10"));
    expect(result.current.values.reps).toBe("10");

    act(() => result.current.setSets("3"));
    expect(result.current.values.sets).toBe("3");

    act(() => result.current.setCaloriesBurned("300"));
    expect(result.current.values.caloriesBurned).toBe("300");

    act(() => result.current.setDate("2026-01-01"));
    expect(result.current.values.date).toBe("2026-01-01");
  });

  it("resetValuesは日付以外を初期値に戻す", () => {
    const { result } = renderHook(() => useWorkoutRecordFormValuesState());

    act(() => {
      result.current.setExerciseId("ベンチプレス");
      result.current.setWeightKg("60");
      result.current.setDate("2026-01-01");
    });

    act(() => result.current.resetValues());

    expect(result.current.values.exerciseId).toBe("");
    expect(result.current.values.weightKg).toBe("");
    expect(result.current.values.date).toBe("2026-01-01");
  });
});
