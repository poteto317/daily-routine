import { createTrainDelayLineActionsResult } from "../state/trainDelayLineActionsResult";

describe("createTrainDelayLineActionsResult", () => {
  it("train delay handlers を公開 shape に載せる", () => {
    const handleAddLine = jest.fn();
    const handleRemoveLine = jest.fn();

    expect(
      createTrainDelayLineActionsResult({
        handleAddLine,
        handleRemoveLine,
      }),
    ).toEqual({
      handleAddLine,
      handleRemoveLine,
    });
  });
});
