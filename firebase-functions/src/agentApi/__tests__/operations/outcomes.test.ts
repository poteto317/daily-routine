/** @jest-environment node */
import {
  createdOutcome,
  deletedOutcome,
  okOutcome,
} from "../../operations/outcomes";

describe("okOutcome", () => {
  it("changes なしなら status 200 と body のみ（changes キーを持たない）", () => {
    const outcome = okOutcome({ items: [] });
    expect(outcome).toEqual({ status: 200, body: { items: [] } });
    expect("changes" in outcome).toBe(false);
  });

  it("changes ありなら書き込み対象として含める", () => {
    expect(okOutcome({ item: 1 }, { field: [1] })).toEqual({
      status: 200,
      body: { item: 1 },
      changes: { field: [1] },
    });
  });
});

describe("createdOutcome", () => {
  it("status 201 と changes を持つ", () => {
    expect(createdOutcome({ item: 1 }, { field: [1] })).toEqual({
      status: 201,
      body: { item: 1 },
      changes: { field: [1] },
    });
  });
});

describe("deletedOutcome", () => {
  it("body は { deleted: id }、status 200、changes を持つ", () => {
    expect(deletedOutcome("id-1", { field: [] })).toEqual({
      status: 200,
      body: { deleted: "id-1" },
      changes: { field: [] },
    });
  });
});
