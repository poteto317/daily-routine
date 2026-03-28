import { createWeightTrackerReloadActionResult } from "../page/weightTrackerReloadActionResult";

describe("createWeightTrackerReloadActionResult", () => {
  it("reloadWeightData を公開 shape に載せる", () => {
    const reloadWeightData = jest.fn();

    expect(createWeightTrackerReloadActionResult({ reloadWeightData })).toEqual(
      {
        reloadWeightData,
      },
    );
  });
});
