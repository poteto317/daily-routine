import type { Routine } from "@/types/routine";
import {
  assignSortOrder,
  createRoutinesForBatchInput,
  createRoutinesForSingleInput,
  migrateMultiDayRoutinesWithGroup,
} from "../routineStateModel";

const baseRoutine: Routine = {
  id: "r1",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: true,
  sortOrder: 1,
  createdAt: "2026-02-13T00:00:00.000Z",
  updatedAt: "2026-02-13T00:00:00.000Z",
};

describe("routineStateModel mutations", () => {
  it("migrateMultiDayRoutinesWithGroupは複数曜日を分割", () => {
    const migrated = migrateMultiDayRoutinesWithGroup([
      { ...baseRoutine, groupId: undefined, daysOfWeek: [1, 3] },
    ]);
    expect(migrated).toHaveLength(2);
    expect(migrated[0]?.groupId).toBeDefined();
    expect(migrated[1]?.groupId).toBe(migrated[0]?.groupId);
  });

  it("createRoutinesForSingleInputは曜日ごと作成", () => {
    const created = createRoutinesForSingleInput([], {
      title: "新規",
      startTime: "09:00",
      duration: 20,
      category: "work",
      daysOfWeek: [1, 2],
      isCompleted: false,
      sortOrder: 0,
    });
    expect(created).toHaveLength(2);
    expect(created[0]?.groupId).toBe(created[1]?.groupId);
  });

  it("createRoutinesForBatchInputは空daysOfWeekを平日に補完", () => {
    const created = createRoutinesForBatchInput(
      [],
      [
        {
          title: "バッチ",
          startTime: "10:00",
          duration: 15,
          category: "study",
          daysOfWeek: [],
          isCompleted: false,
        },
      ],
    );
    expect(created).toHaveLength(5);
    expect(created.map((item) => item.daysOfWeek[0])).toEqual([1, 2, 3, 4, 5]);
  });

  it("assignSortOrderは配列順に振り直す", () => {
    const reordered = assignSortOrder([
      { ...baseRoutine, id: "b", sortOrder: 99 },
      { ...baseRoutine, id: "a", sortOrder: 42 },
    ]);
    expect(reordered[0]?.sortOrder).toBe(0);
    expect(reordered[1]?.sortOrder).toBe(1);
  });
});
