import { createTestMatrixSelectionStateResult } from "../testMatrixSelectionStateResult";

describe("createTestMatrixSelectionStateResult", () => {
  it("selection state の公開 shape を返す", () => {
    const setSelectedItemId = jest.fn();

    expect(
      createTestMatrixSelectionStateResult({
        selectedItemId: "1-1",
        setSelectedItemId,
      }),
    ).toEqual({
      selectedItemId: "1-1",
      setSelectedItemId,
    });
  });
});
