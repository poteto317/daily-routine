import { createTestMatrixFilterStateResult } from "../testMatrixFilterStateResult";

describe("createTestMatrixFilterStateResult", () => {
  it("filter state の公開 shape を返す", () => {
    const setFilterStatus = jest.fn();

    expect(
      createTestMatrixFilterStateResult({
        filterStatus: "ok",
        setFilterStatus,
      }),
    ).toEqual({
      filterStatus: "ok",
      setFilterStatus,
    });
  });
});
