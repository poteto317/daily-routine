import { migrateMultiDayRoutinesWithGroup } from "../routineGroupMultiDayMigration";
import {
  makeRoutine,
  pick,
  setupFixedClockAndSequentialUuid,
} from "./routineGroup.test-utils";

describe("routineGroupMultiDayMigration", () => {
  const { randomUuidSpy } = setupFixedClockAndSequentialUuid();

  describe("migrateMultiDayRoutinesWithGroup", () => {
    it("空配列は空配列を返す", () => {
      expect(migrateMultiDayRoutinesWithGroup([])).toEqual([]);
    });

    it("単一曜日のルーティンは groupId を自身の id で補い、他の値は変えない", () => {
      const routine = makeRoutine({
        id: "single",
        isCompleted: true,
        sortOrder: 4,
      });

      expect(migrateMultiDayRoutinesWithGroup([routine])).toEqual([
        { ...routine, groupId: "single" },
      ]);
      expect(randomUuidSpy()).not.toHaveBeenCalled();
    });

    it("曜日が空のルーティンも分割せず groupId だけ補う", () => {
      const routine = makeRoutine({ id: "empty", daysOfWeek: [] });

      expect(migrateMultiDayRoutinesWithGroup([routine])).toEqual([
        { ...routine, groupId: "empty" },
      ]);
    });

    it("既存の groupId があればそれを使う", () => {
      const routine = makeRoutine({ id: "single", groupId: "g-existing" });

      expect(migrateMultiDayRoutinesWithGroup([routine])[0]?.groupId).toBe(
        "g-existing",
      );
    });

    it("複数曜日は曜日ごとに分割し、2 件目以降は新しい id と全体の最大値に続く sortOrder を持つ", () => {
      const routines = [
        makeRoutine({
          id: "multi",
          daysOfWeek: [1, 3, 5],
          sortOrder: 2,
          isCompleted: true,
        }),
        makeRoutine({ id: "other", daysOfWeek: [2], sortOrder: 7 }),
      ];

      const migrated = migrateMultiDayRoutinesWithGroup(routines);

      expect(
        pick(migrated, [
          "id",
          "groupId",
          "daysOfWeek",
          "sortOrder",
          "isCompleted",
        ]),
      ).toEqual([
        {
          id: "multi",
          groupId: "multi",
          daysOfWeek: [1],
          sortOrder: 2,
          isCompleted: false,
        },
        {
          id: "generated-1",
          groupId: "multi",
          daysOfWeek: [3],
          sortOrder: 8,
          isCompleted: false,
        },
        {
          id: "generated-2",
          groupId: "multi",
          daysOfWeek: [5],
          sortOrder: 9,
          isCompleted: false,
        },
        {
          id: "other",
          groupId: "other",
          daysOfWeek: [2],
          sortOrder: 7,
          isCompleted: false,
        },
      ]);
    });

    it("sortOrder が負でも採番は 0 を下限にする", () => {
      const migrated = migrateMultiDayRoutinesWithGroup([
        makeRoutine({ id: "m", daysOfWeek: [1, 2], sortOrder: -5 }),
      ]);

      expect(migrated.map((routine) => routine.sortOrder)).toEqual([-5, 1]);
    });
  });
});
