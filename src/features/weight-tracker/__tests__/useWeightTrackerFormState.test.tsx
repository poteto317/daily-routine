import { act, renderHook } from "@testing-library/react";
import type { WeightRecord } from "@/types/routine";
import { useWeightTrackerFormState } from "../page/useWeightTrackerFormState";

describe("useWeightTrackerFormState", () => {
  const savedRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-12",
    weight: 69.5,
    notes: "updated",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  it("初期フォーム値と入力変更を管理する", () => {
    const { result } = renderHook(() =>
      useWeightTrackerFormState({
        initialTodayRecord: savedRecord,
        getTodayWeightRecord: () => savedRecord,
      }),
    );

    expect(result.current.weightInput).toBe("69.5");
    expect(result.current.notesInput).toBe("updated");
    expect(result.current.showForm).toBe(false);

    act(() => {
      result.current.setShowForm(true);
      result.current.setWeightInput("70.0");
      result.current.setNotesInput("temp");
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.weightInput).toBe("70.0");
    expect(result.current.notesInput).toBe("temp");
  });

  it("cancel で最新レコード由来の入力値へ戻してフォームを閉じる", () => {
    const getTodayWeightRecord = jest.fn(() => savedRecord);
    const { result } = renderHook(() =>
      useWeightTrackerFormState({
        initialTodayRecord: null,
        getTodayWeightRecord,
      }),
    );

    act(() => {
      result.current.setShowForm(true);
      result.current.setWeightInput("70.0");
      result.current.setNotesInput("temp");
      result.current.handleCancelForm();
    });

    expect(getTodayWeightRecord).toHaveBeenCalled();
    expect(result.current.showForm).toBe(false);
    expect(result.current.weightInput).toBe("69.5");
    expect(result.current.notesInput).toBe("updated");
  });
});
