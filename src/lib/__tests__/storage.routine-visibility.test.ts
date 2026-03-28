import {
  filterRoutinesByDayOfWeek,
  shouldShowRoutineForDate,
} from "../storage";
import { createRoutine } from "./storage.test-utils";

jest.mock("../holidays", () => ({
  isHoliday: jest.fn((date: Date) =>
    date.toISOString().startsWith("2024-01-01"),
  ),
}));

describe("storage routine visibility", () => {
  it("曜日でルーティンをフィルタリングできる", () => {
    const routines = [
      createRoutine({ id: "1", daysOfWeek: [1, 2, 3, 4, 5] }),
      createRoutine({ id: "2", daysOfWeek: [0, 6], sortOrder: 1 }),
    ];

    expect(filterRoutinesByDayOfWeek(routines, 1)).toHaveLength(1);
    expect(filterRoutinesByDayOfWeek(routines, 0)).toHaveLength(1);
  });

  it("通常日は一致曜日のみ表示し、祝日専用は非表示", () => {
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [1] }),
        new Date("2024-01-08"),
      ),
    ).toBe(true);
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [2, 3] }),
        new Date("2024-01-08"),
      ),
    ).toBe(false);
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [7] }),
        new Date("2024-01-08"),
      ),
    ).toBe(false);
  });

  it("祝日は祝日フラグを含むルーティンのみ表示", () => {
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [1] }),
        new Date("2024-01-01"),
      ),
    ).toBe(false);
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [7] }),
        new Date("2024-01-01"),
      ),
    ).toBe(true);
    expect(
      shouldShowRoutineForDate(
        createRoutine({ daysOfWeek: [1, 7] }),
        new Date("2024-01-01"),
      ),
    ).toBe(true);
  });
});
