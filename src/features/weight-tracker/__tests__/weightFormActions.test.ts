import type { WeightRecord } from "@/types/routine";
import { createCancelWeightFormHandler } from "../page/weightFormActions";

describe("weightFormActions", () => {
  const savedRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-12",
    weight: 69.5,
    notes: "updated",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  it("cancel handler が最新レコード入力へ戻してフォームを閉じる", () => {
    const setWeightInput = jest.fn();
    const setNotesInput = jest.fn();
    const setShowForm = jest.fn();

    createCancelWeightFormHandler({
      getTodayWeightRecord: () => savedRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
    })();

    expect(setWeightInput).toHaveBeenCalledWith("69.5");
    expect(setNotesInput).toHaveBeenCalledWith("updated");
    expect(setShowForm).toHaveBeenCalledWith(false);
  });
});