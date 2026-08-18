import "./helpers.test.setup";
import {
  createSwipeHandler,
  getCategoryInfo,
  getRoutineCardStyle,
  isRoutinePast,
} from "../helpers";
import {
  baseRoutine,
  mockGetCurrentTime,
  mockToJstDay,
  mockGetSettings,
  setupHelpersDefaults,
} from "./helpers.test.setup";
import { type Routine } from "@/types/routine";

describe("helpers presentation", () => {
  beforeEach(setupHelpersDefaults);

  it("isRoutinePastは当日かつ時刻超過でtrue", () => {
    mockToJstDay.mockReturnValue(1);
    mockGetCurrentTime.mockReturnValue("09:00");
    expect(isRoutinePast(baseRoutine)).toBe(true);
  });

  it("開始時刻が1桁時の旧データでも時刻超過を正しく判定する", () => {
    mockToJstDay.mockReturnValue(1);
    mockGetCurrentTime.mockReturnValue("09:00");
    expect(isRoutinePast({ ...baseRoutine, startTime: "8:30" })).toBe(true);
  });

  it("カテゴリ情報とカードスタイルを返す", () => {
    expect(
      getCategoryInfo({ category: "health" as Routine["category"] }).value,
    ).toBe("health");
    expect(
      getRoutineCardStyle({ ...baseRoutine, isCompleted: true }, false),
    ).toContain("bg-green-50");
    expect(
      getRoutineCardStyle({ ...baseRoutine, isCompleted: false }, true),
    ).toContain("bg-yellow-50");
  });

  it("スワイプ設定に応じて編集/削除を呼ぶ", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    mockGetSettings.mockReturnValue({ swipeAction: "delete" } as never);
    createSwipeHandler(onEdit, onDelete)(baseRoutine);
    expect(onDelete).toHaveBeenCalledWith("r1");

    mockGetSettings.mockReturnValue({ swipeAction: "edit" } as never);
    createSwipeHandler(onEdit, onDelete)(baseRoutine);
    expect(onEdit).toHaveBeenCalledWith(baseRoutine);
  });
});
