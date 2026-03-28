import type { WeightRecord } from "@/types/routine";
import { createWeightTrackerStateResult } from "../page/weightTrackerStateResult";

describe("weightTrackerStateResult", () => {
  it("weight tracker 表示用の result を組み立てる", () => {
    const setWeightInput = jest.fn();
    const setNotesInput = jest.fn();
    const setShowForm = jest.fn();
    const handleSaveWeight = jest.fn();
    const handleCancelForm = jest.fn();
    const handleDeleteRecord = jest.fn();
    const recentRecords: WeightRecord[] = [
      {
        id: "weight-1",
        date: "2024-01-12",
        weight: 69.5,
        notes: "updated",
        createdAt: "2024-01-12T07:00:00.000Z",
        updatedAt: "2024-01-12T07:00:00.000Z",
      },
    ];

    expect(
      createWeightTrackerStateResult({
        today: "2024-01-12",
        todayRecord: recentRecords[0],
        weightInput: "69.5",
        notesInput: "updated",
        showForm: true,
        recentRecords,
        setWeightInput,
        setNotesInput,
        setShowForm,
        handleSaveWeight,
        handleCancelForm,
        handleDeleteRecord,
      }),
    ).toEqual({
      today: "2024-01-12",
      todayRecord: recentRecords[0],
      weightInput: "69.5",
      notesInput: "updated",
      showForm: true,
      recentRecords,
      setWeightInput,
      setNotesInput,
      setShowForm,
      handleSaveWeight,
      handleCancelForm,
      handleDeleteRecord,
    });
  });
});
