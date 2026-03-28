import type { WeightRecord } from "@/types/routine";
import { createLoadWeightDataAction } from "../page/weightReloadActions";

describe("weightReloadActions", () => {
  const savedRecord: WeightRecord = {
    id: "weight-1",
    date: "2024-01-12",
    weight: 69.5,
    notes: "updated",
    createdAt: "2024-01-12T07:00:00.000Z",
    updatedAt: "2024-01-12T07:00:00.000Z",
  };

  it("load action が today/recent/form state を再構築する", () => {
    const setTodayRecord = jest.fn();
    const setWeightInput = jest.fn();
    const setNotesInput = jest.fn();
    const setRecentRecords = jest.fn();

    createLoadWeightDataAction({
      getTodayWeightRecord: () => savedRecord,
      getWeightHistory: () => ({ [savedRecord.date]: savedRecord }),
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setRecentRecords,
    })();

    expect(setTodayRecord).toHaveBeenCalledWith(savedRecord);
    expect(setWeightInput).toHaveBeenCalledWith("69.5");
    expect(setNotesInput).toHaveBeenCalledWith("updated");
    expect(setRecentRecords).toHaveBeenCalledWith([savedRecord]);
  });
});