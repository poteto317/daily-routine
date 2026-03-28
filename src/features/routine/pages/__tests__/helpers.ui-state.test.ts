import {
  getAddButtonLabel,
  getCategoryFilterButtonClassName,
  getDaySelectorButtonClassName,
  getEmptyMessage,
  ROUTINE_EMPTY_STATE_TEXT,
} from "../helpers";

describe("routine page helpers ui state", () => {
  it("empty message を件数と view mode から返す", () => {
    expect(getEmptyMessage(0, 1)).toBe(ROUTINE_EMPTY_STATE_TEXT.noRoutines);
    expect(getEmptyMessage(1, "holiday")).toBe(
      ROUTINE_EMPTY_STATE_TEXT.noHolidayRoutines,
    );
    expect(getEmptyMessage(1, 1)).toBe(ROUTINE_EMPTY_STATE_TEXT.noDayRoutines);
  });

  it("add button label を件数から返す", () => {
    expect(getAddButtonLabel(0)).toBe(ROUTINE_EMPTY_STATE_TEXT.addFirst);
    expect(getAddButtonLabel(2)).toBe(ROUTINE_EMPTY_STATE_TEXT.addMore);
  });

  it("category filter button class を状態から返す", () => {
    expect(getCategoryFilterButtonClassName(false)).toContain("bg-white");
    expect(getCategoryFilterButtonClassName(true)).toBe(
      "bg-blue-600 text-white shadow-md",
    );
    expect(
      getCategoryFilterButtonClassName(true, "bg-red-500 text-white"),
    ).toContain("ring-2 ring-blue-500 shadow-md");
  });

  it("day selector button class を状態から返す", () => {
    expect(getDaySelectorButtonClassName(true, true)).toBe(
      "bg-red-600 text-white shadow-md",
    );
    expect(getDaySelectorButtonClassName(true, false)).toBe(
      "bg-purple-600 text-white shadow-md",
    );
    expect(getDaySelectorButtonClassName(false, false)).toContain("bg-white");
  });
});
