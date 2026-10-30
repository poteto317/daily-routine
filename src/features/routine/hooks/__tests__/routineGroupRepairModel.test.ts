import type { Routine } from "@/types/routine";

import {
  migrateMultiDayRoutinesWithGroup,
  repairCorruptedGroupRoutines,
} from "../routineGroupRepairModel";

const FIXED_NOW = "2026-04-13T00:31:00.000Z";
const CREATED_AT = "2026-02-13T00:00:00.000Z";

type Uuid = `${string}-${string}-${string}-${string}-${string}`;

const makeRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "r",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  ...overrides,
});

/** 結果のうち検証したい項目だけを取り出す */
const pick = <K extends keyof Routine>(routines: Routine[], keys: K[]) =>
  routines.map((routine) =>
    Object.fromEntries(keys.map((key) => [key, routine[key]])),
  );

describe("routineGroupRepairModel", () => {
  let randomUuidSpy: jest.SpyInstance;
  let uuidCounter: number;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(FIXED_NOW));
    uuidCounter = 0;
    randomUuidSpy = jest
      .spyOn(crypto, "randomUUID")
      .mockImplementation(() => `generated-${++uuidCounter}` as Uuid);
  });

  afterEach(() => {
    randomUuidSpy.mockRestore();
    jest.useRealTimers();
  });

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
      expect(randomUuidSpy).not.toHaveBeenCalled();
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

  describe("repairCorruptedGroupRoutines", () => {
    it("汚染がなければ同じ配列の参照を返す", () => {
      const routines = [
        makeRoutine({ id: "a", groupId: "g", daysOfWeek: [1] }),
        makeRoutine({ id: "b", groupId: "g", daysOfWeek: [2] }),
        makeRoutine({ id: "c", daysOfWeek: [1, 2, 3] }),
      ];

      expect(repairCorruptedGroupRoutines(routines)).toBe(routines);
    });

    it("別のグループどうしで曜日が重なっても汚染とみなさない", () => {
      const routines = [
        makeRoutine({ id: "a", groupId: "g1", daysOfWeek: [1] }),
        makeRoutine({ id: "b", groupId: "g2", daysOfWeek: [1] }),
      ];

      expect(repairCorruptedGroupRoutines(routines)).toBe(routines);
    });

    it("同じ曜日の重複は先頭のメンバーを残し、グループ外のルーティンも保持して sortOrder を振り直す", () => {
      const routines = [
        makeRoutine({ id: "free", sortOrder: 10, daysOfWeek: [1, 2] }),
        makeRoutine({ id: "a1", groupId: "g", daysOfWeek: [1], sortOrder: 0 }),
        makeRoutine({ id: "a2", groupId: "g", daysOfWeek: [1], sortOrder: 1 }),
        makeRoutine({ id: "b", groupId: "g", daysOfWeek: [3], sortOrder: 2 }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "daysOfWeek", "sortOrder"])).toEqual([
        { id: "a1", daysOfWeek: [1], sortOrder: 0 },
        { id: "b", daysOfWeek: [3], sortOrder: 1 },
        { id: "free", daysOfWeek: [1, 2], sortOrder: 2 },
      ]);
    });

    it("重複した曜日に今日の完了済みメンバーがあればそれを残す", () => {
      const routines = [
        makeRoutine({ id: "a1", groupId: "g", daysOfWeek: [1], sortOrder: 0 }),
        makeRoutine({ id: "a2", groupId: "g", daysOfWeek: [1], sortOrder: 1 }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines, ["a2"]);

      expect(repaired.map((routine) => routine.id)).toEqual(["a2"]);
    });

    it("完了済み id がどの重複候補にも無ければ先頭のメンバーを残す", () => {
      const routines = [
        makeRoutine({ id: "a1", groupId: "g", daysOfWeek: [1], sortOrder: 0 }),
        makeRoutine({ id: "a2", groupId: "g", daysOfWeek: [1], sortOrder: 1 }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines, ["other"]);

      expect(repaired.map((routine) => routine.id)).toEqual(["a1"]);
    });

    it("複数曜日を持つメンバーは、単一曜日のメンバーが無い曜日の枠として id と createdAt を再利用する", () => {
      const routines = [
        makeRoutine({
          id: "clean-mon",
          groupId: "g",
          daysOfWeek: [1],
          sortOrder: 3,
        }),
        makeRoutine({
          id: "dirty-z",
          groupId: "g",
          daysOfWeek: [1, 3],
          sortOrder: 5,
          createdAt: "2026-01-02T00:00:00.000Z",
        }),
        makeRoutine({
          id: "dirty-a",
          groupId: "g",
          daysOfWeek: [3, 5],
          sortOrder: 5,
          createdAt: "2026-01-01T00:00:00.000Z",
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      // sortOrder が同じなら id の昇順で再利用される（dirty-a → dirty-z）
      expect(
        pick(repaired, [
          "id",
          "daysOfWeek",
          "sortOrder",
          "createdAt",
          "updatedAt",
        ]),
      ).toEqual([
        {
          id: "clean-mon",
          daysOfWeek: [1],
          sortOrder: 0,
          createdAt: CREATED_AT,
          updatedAt: CREATED_AT,
        },
        {
          id: "dirty-a",
          daysOfWeek: [3],
          sortOrder: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: FIXED_NOW,
        },
        {
          id: "dirty-z",
          daysOfWeek: [5],
          sortOrder: 2,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: FIXED_NOW,
        },
      ]);
      expect(randomUuidSpy).not.toHaveBeenCalled();
    });

    it("再利用する複数曜日メンバーは今日の完了済みを優先し、次に sortOrder の小さい順で選ぶ", () => {
      const routines = [
        makeRoutine({ id: "d1", groupId: "g", daysOfWeek: [1, 2] }),
        makeRoutine({
          id: "d2",
          groupId: "g",
          daysOfWeek: [1, 2],
          sortOrder: 1,
        }),
        makeRoutine({
          id: "d3",
          groupId: "g",
          daysOfWeek: [1, 2],
          sortOrder: 2,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines, ["d3"]);

      expect(pick(repaired, ["id", "daysOfWeek"])).toEqual([
        { id: "d3", daysOfWeek: [1] },
        { id: "d1", daysOfWeek: [2] },
      ]);
    });

    it("再利用できるメンバーが足りない曜日は新しい id と現在時刻の createdAt で作る", () => {
      const template = makeRoutine({
        id: "dirty",
        groupId: "g",
        title: "テンプレ",
        daysOfWeek: [2, 4],
        sortOrder: 6,
      });

      const repaired = repairCorruptedGroupRoutines([template]);

      expect(repaired).toEqual([
        {
          ...template,
          daysOfWeek: [2],
          sortOrder: 0,
          updatedAt: FIXED_NOW,
        },
        {
          ...template,
          id: "generated-1",
          daysOfWeek: [4],
          sortOrder: 1,
          createdAt: FIXED_NOW,
          updatedAt: FIXED_NOW,
        },
      ]);
    });

    it("修復時は全グループを曜日ごとに 1 件へ整理し、全体の並び順で sortOrder を振り直す", () => {
      const routines = [
        makeRoutine({ id: "x", groupId: "gx", daysOfWeek: [6], sortOrder: 1 }),
        makeRoutine({ id: "y", groupId: "gy", daysOfWeek: [0, 6] }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      // gy の 2 件目は sortOrder が「テンプレートの値 + 曜日の順番」で 1 になり、
      // x（sortOrder 1）と並ぶため id の昇順で前に来る
      expect(
        pick(repaired, ["id", "groupId", "daysOfWeek", "sortOrder"]),
      ).toEqual([
        { id: "y", groupId: "gy", daysOfWeek: [0], sortOrder: 0 },
        { id: "generated-1", groupId: "gy", daysOfWeek: [6], sortOrder: 1 },
        { id: "x", groupId: "gx", daysOfWeek: [6], sortOrder: 2 },
      ]);
    });
  });
});
