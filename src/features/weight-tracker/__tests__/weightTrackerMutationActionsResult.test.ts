import { createWeightTrackerMutationActionsResult } from "../page/weightTrackerMutationActionsResult";

describe("createWeightTrackerMutationActionsResult", () => {
  it("save/delete action を公開 shape に載せる", () => {
    const handleDeleteRecord = jest.fn();
    const handleSaveWeight = jest.fn();

    expect(
      createWeightTrackerMutationActionsResult({
        handleDeleteRecord,
        handleSaveWeight,
      }),
    ).toEqual({
      handleDeleteRecord,
      handleSaveWeight,
    });
  });
});
