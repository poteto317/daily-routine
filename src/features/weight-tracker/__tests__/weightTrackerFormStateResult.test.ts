import { createWeightTrackerFormStateResult } from "../page/weightTrackerFormStateResult";

describe("createWeightTrackerFormStateResult", () => {
  it("input と visibility の公開 shape に cancel action をまとめて返す", () => {
    const inputState = {
      notesInput: "memo",
      weightInput: "70.1",
      setNotesInput: jest.fn(),
      setWeightInput: jest.fn(),
    };
    const visibilityState = {
      showForm: true,
      setShowForm: jest.fn(),
    };
    const handleCancelForm = jest.fn();

    const result = createWeightTrackerFormStateResult({
      inputState,
      visibilityState,
      handleCancelForm,
    });

    expect(result).toEqual({
      ...inputState,
      ...visibilityState,
      handleCancelForm,
    });
  });
});
