import "./helpers.test.setup";
import {
  createSwipeHandler,
  getCategoryInfo,
  getRoutineCardStyle,
  isRoutinePast,
} from "../helpers";
import {
  baseRoutine,
  mockToJstDay,
  mockToJstTime,
  mockGetSettings,
  setupHelpersDefaults,
} from "./helpers.test.setup";
import { type Routine } from "@/types/routine";

/** isRoutinePast に渡す現在時刻。曜日と時刻はモックで決めるので、値そのものは判定に影響しない */
const NOW_MS = Date.parse("2026-11-12T09:00:00+09:00");

describe("helpers presentation", () => {
  beforeEach(setupHelpersDefaults);

  it("isRoutinePastは当日かつ時刻超過でtrue", () => {
    mockToJstDay.mockReturnValue(1);
    mockToJstTime.mockReturnValue("09:00");
    expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(true);
    // 曜日と時刻は、渡した時刻から求める（関数の中で時計を読まない）
    expect(mockToJstDay).toHaveBeenCalledWith(new Date(NOW_MS));
    expect(mockToJstTime).toHaveBeenCalledWith(new Date(NOW_MS));
  });

  it("開始時刻が1桁時の旧データでも時刻超過を正しく判定する", () => {
    mockToJstDay.mockReturnValue(1);
    mockToJstTime.mockReturnValue("09:00");
    expect(isRoutinePast({ ...baseRoutine, startTime: "8:30" }, NOW_MS)).toBe(
      true,
    );
  });

  it("開始時刻ちょうどは、まだ超過にしない", () => {
    mockToJstDay.mockReturnValue(1);
    mockToJstTime.mockReturnValue("08:00");
    expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(false);
  });

  it("今日の曜日でないルーティンは、時刻を過ぎていても超過にしない", () => {
    mockToJstDay.mockReturnValue(2);
    mockToJstTime.mockReturnValue("09:00");
    expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(false);
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
