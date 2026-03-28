import { hasTimeConflict } from "../storage";
import { createRoutine } from "./storage.test-utils";

jest.mock("../holidays", () => ({
  isHoliday: jest.fn((date: Date) =>
    date.toISOString().startsWith("2024-01-01"),
  ),
}));

describe("storage hasTimeConflict", () => {
  const baseRoutines = [
    createRoutine({
      id: "1",
      title: "Morning",
      startTime: "09:00",
      duration: 30,
    }),
    createRoutine({
      id: "2",
      title: "Lunch",
      startTime: "12:00",
      duration: 60,
      sortOrder: 1,
    }),
  ];

  it("時間が重複する場合true、重複しない場合false", () => {
    expect(
      hasTimeConflict("09:15", 30, baseRoutines, undefined, [1, 2, 3])
        .hasConflict,
    ).toBe(true);
    expect(
      hasTimeConflict("10:00", 30, baseRoutines, undefined, [1, 2, 3])
        .hasConflict,
    ).toBe(false);
  });

  it("編集中IDは除外し、終了時刻ぴったり開始は重複しない", () => {
    expect(
      hasTimeConflict("09:15", 30, baseRoutines, "1", [1, 2, 3]).hasConflict,
    ).toBe(false);
    expect(
      hasTimeConflict("09:30", 30, baseRoutines, undefined, [1, 2, 3])
        .hasConflict,
    ).toBe(false);
  });

  it("曜日未選択または曜日不一致なら重複しない", () => {
    const holidayOnly = [createRoutine({ id: "3", daysOfWeek: [7] })];

    expect(
      hasTimeConflict("09:15", 30, baseRoutines, undefined, []).hasConflict,
    ).toBe(false);
    expect(
      hasTimeConflict("09:00", 30, holidayOnly, undefined, [1, 2, 3])
        .hasConflict,
    ).toBe(false);
  });

  it("曜日が重なる場合や祝日を含む場合は重複する", () => {
    const withHoliday = [
      createRoutine({ id: "4", daysOfWeek: [1, 2, 3, 4, 5, 7] }),
    ];

    expect(
      hasTimeConflict("09:15", 30, baseRoutines, undefined, [1, 2, 3])
        .hasConflict,
    ).toBe(true);
    expect(
      hasTimeConflict("09:00", 30, withHoliday, undefined, [7]).hasConflict,
    ).toBe(true);
  });
});
