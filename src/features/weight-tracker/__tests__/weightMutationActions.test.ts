import type { WeightRecord } from "@/types/routine";
import {
  createDeleteWeightHandler,
  createSaveWeightHandler,
} from "../page/weightMutationActions";

describe("weightMutationActions", () => {
  const savedRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-12",
    weight: 69.5,
    notes: "updated",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  it("save handler が保存・再読込・フォームクローズを行う", () => {
    const saveWeight = jest.fn();
    const setTodayRecord = jest.fn();
    const setWeightInput = jest.fn();
    const setNotesInput = jest.fn();
    const setShowForm = jest.fn();
    const setRecentRecords = jest.fn();

    createSaveWeightHandler({
      today: "2024-01-12",
      weightInput: "69.5",
      notesInput: " updated ",
      saveWeight,
      getTodayWeightRecord: () => savedRecord,
      getWeightHistory: () => ({ [savedRecord.date]: savedRecord }),
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
      setRecentRecords,
    })();

    expect(saveWeight).toHaveBeenCalledWith("2024-01-12", 69.5, "updated");
    expect(setTodayRecord).toHaveBeenCalledWith(savedRecord);
    expect(setWeightInput).toHaveBeenCalledWith("69.5");
    expect(setNotesInput).toHaveBeenCalledWith("updated");
    expect(setRecentRecords).toHaveBeenCalledWith([savedRecord]);
    expect(setShowForm).toHaveBeenCalledWith(false);
  });

  it("delete handler が確認後に削除・再読込する", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const deleteWeight = jest.fn();
    const setTodayRecord = jest.fn();
    const setWeightInput = jest.fn();
    const setNotesInput = jest.fn();
    const setRecentRecords = jest.fn();
    const remainingRecord: WeightRecord = {
      ...savedRecord,
      id: "weight-2",
      date: "2024-01-11",
    };

    createDeleteWeightHandler({
      deleteWeight,
      getTodayWeightRecord: () => null,
      getWeightHistory: () => ({ [remainingRecord.date]: remainingRecord }),
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setRecentRecords,
    })("2024-01-12");

    expect(deleteWeight).toHaveBeenCalledWith("2024-01-12");
    expect(setTodayRecord).toHaveBeenCalledWith(null);
    expect(setWeightInput).toHaveBeenCalledWith("");
    expect(setNotesInput).toHaveBeenCalledWith("");
    expect(setRecentRecords).toHaveBeenCalledWith([remainingRecord]);

    confirmSpy.mockRestore();
  });
});
