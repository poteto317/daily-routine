import { createWeightTrackerActionsResult } from "../page/weightTrackerActionsResult";

describe("createWeightTrackerActionsResult", () => {
  it("weight tracker action hook の公開 shape を組み立てる", () => {
    const reloadWeightData = jest.fn();
    const handleSaveWeight = jest.fn();
    const handleDeleteRecord = jest.fn();

    const result = createWeightTrackerActionsResult({
      handleDeleteRecord,
      handleSaveWeight,
      reloadWeightData,
    });

    expect(result).toEqual({
      handleDeleteRecord,
      handleSaveWeight,
      reloadWeightData,
    });
  });
});
