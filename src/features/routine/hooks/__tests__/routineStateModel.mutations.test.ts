import type { Routine } from "@/types/routine";
import {
  assignSortOrder,
  createRoutinesForBatchInput,
  createRoutinesForSingleInput,
  migrateMultiDayRoutinesWithGroup,
  repairCorruptedGroupRoutines,
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

  describe("repairCorruptedGroupRoutines", () => {
    it("汚染がなければ元の配列をそのまま返す", () => {
      const routines: Routine[] = [
        { ...baseRoutine, groupId: "g1", daysOfWeek: [1] },
        { ...baseRoutine, id: "r2", groupId: "g1", daysOfWeek: [3] },
      ];
      const result = repairCorruptedGroupRoutines(routines);
      expect(result).toBe(routines); // 参照が同一
    });

    it("daysOfWeekが複数の汚染データを正規化する", () => {
      const routines: Routine[] = [
        { ...baseRoutine, id: "r1", groupId: "g1", daysOfWeek: [1, 3, 5] },
        { ...baseRoutine, id: "r2", groupId: "g1", daysOfWeek: [1, 3, 5] },
        { ...baseRoutine, id: "r3", groupId: "g1", daysOfWeek: [1, 3, 5] },
      ];
      const result = repairCorruptedGroupRoutines(routines);
      expect(result).toHaveLength(3);
      const days = result
        .map((r) => r.daysOfWeek)
        .sort((a, b) => a[0]! - b[0]!);
      expect(days).toEqual([[1], [3], [5]]);
      // 全て同じ groupId
      expect(result.every((r) => r.groupId === "g1")).toBe(true);
    });

    it("同一曜日の重複エントリを除去する", () => {
      const routines: Routine[] = [
        { ...baseRoutine, id: "r1", groupId: "g1", daysOfWeek: [1] },
        { ...baseRoutine, id: "r2", groupId: "g1", daysOfWeek: [1] },
        { ...baseRoutine, id: "r3", groupId: "g1", daysOfWeek: [3] },
      ];
      const result = repairCorruptedGroupRoutines(routines);
      expect(result).toHaveLength(2);
      const days = result
        .map((r) => r.daysOfWeek)
        .sort((a, b) => a[0]! - b[0]!);
      expect(days).toEqual([[1], [3]]);
    });

    it("completedRoutineIds に含まれる重複エントリを優先して残す", () => {
      const routines: Routine[] = [
        { ...baseRoutine, id: "r1", groupId: "g1", daysOfWeek: [1] },
        { ...baseRoutine, id: "r2", groupId: "g1", daysOfWeek: [1] }, // r2 が完了済み
        { ...baseRoutine, id: "r3", groupId: "g1", daysOfWeek: [3] },
      ];
      // r2 が completedRoutineIds にある → r2 を優先して残す
      const result = repairCorruptedGroupRoutines(routines, ["r2"]);
      expect(result).toHaveLength(2);
      const day1Entry = result.find((r) => r.daysOfWeek[0] === 1);
      expect(day1Entry?.id).toBe("r2");
    });

    it("groupIdなしのルーティンはそのまま残す", () => {
      const routines: Routine[] = [
        { ...baseRoutine, id: "r1", groupId: undefined, daysOfWeek: [1] },
        { ...baseRoutine, id: "r2", groupId: "g1", daysOfWeek: [1, 3] },
      ];
      const result = repairCorruptedGroupRoutines(routines);
      expect(result.find((r) => r.id === "r1")).toBeDefined();
    });

    it("recycled ID では元メンバーの createdAt を保持し updatedAt のみ更新する", () => {
      const fixedNow = new Date("2026-04-13T00:30:00.000Z");
      jest.useFakeTimers().setSystemTime(fixedNow);

      try {
        const routines: Routine[] = [
          {
            ...baseRoutine,
            id: "r1",
            groupId: "g1",
            daysOfWeek: [1, 3],
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-05T00:00:00.000Z",
          },
          {
            ...baseRoutine,
            id: "r2",
            groupId: "g1",
            daysOfWeek: [1, 3],
            createdAt: "2025-02-01T00:00:00.000Z",
            updatedAt: "2025-02-05T00:00:00.000Z",
          },
        ];

        const result = repairCorruptedGroupRoutines(routines);
        const repairedR1 = result.find((r) => r.id === "r1");
        const repairedR2 = result.find((r) => r.id === "r2");

        expect(repairedR1).toMatchObject({
          id: "r1",
          daysOfWeek: [1],
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: fixedNow.toISOString(),
        });
        expect(repairedR2).toMatchObject({
          id: "r2",
          daysOfWeek: [3],
          createdAt: "2025-02-01T00:00:00.000Z",
          updatedAt: fixedNow.toISOString(),
        });
      } finally {
        jest.useRealTimers();
      }
    });

    it("dirty member が不足して新規 UUID を使う場合は createdAt と updatedAt を now にする", () => {
      const fixedNow = new Date("2026-04-13T00:31:00.000Z");
      jest.useFakeTimers().setSystemTime(fixedNow);
      const randomUuidSpy = jest
        .spyOn(crypto, "randomUUID")
        .mockReturnValueOnce("generated-1")
        .mockReturnValueOnce("generated-2");

      try {
        const routines: Routine[] = [
          {
            ...baseRoutine,
            id: "r1",
            groupId: "g1",
            daysOfWeek: [1, 3, 5],
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-05T00:00:00.000Z",
          },
        ];

        const result = repairCorruptedGroupRoutines(routines);

        expect(result.find((r) => r.id === "generated-1")).toMatchObject({
          id: "generated-1",
          daysOfWeek: [3],
          createdAt: fixedNow.toISOString(),
          updatedAt: fixedNow.toISOString(),
        });
        expect(result.find((r) => r.id === "generated-2")).toMatchObject({
          id: "generated-2",
          daysOfWeek: [5],
          createdAt: fixedNow.toISOString(),
          updatedAt: fixedNow.toISOString(),
        });
      } finally {
        randomUuidSpy.mockRestore();
        jest.useRealTimers();
      }
    });

    it("修復後の sortOrder は一貫した連番になる", () => {
      // existing メンバーが高い sortOrder を持ち、新規生成エントリと混在する場合
      const routines: Routine[] = [
        {
          ...baseRoutine,
          id: "r1",
          groupId: "g1",
          daysOfWeek: [1],
          sortOrder: 10,
        },
        {
          ...baseRoutine,
          id: "r2",
          groupId: "g1",
          daysOfWeek: [1, 3, 5], // 汚染: 複数曜日
          sortOrder: 0,
        },
      ];
      const result = repairCorruptedGroupRoutines(routines);
      expect(result).toHaveLength(3);
      const sortOrders = result.map((r) => r.sortOrder).sort((a, b) => a - b);
      expect(sortOrders).toEqual([0, 1, 2]);
    });

    it("sortOrder が undefined/NaN のデータでもソート順が安定する", () => {
      const routines: Routine[] = [
        {
          ...baseRoutine,
          id: "r1",
          groupId: "g1",
          daysOfWeek: [1, 3], // 汚染
          sortOrder: undefined as unknown as number,
        },
        {
          ...baseRoutine,
          id: "r2",
          groupId: "g1",
          daysOfWeek: [1, 3], // 汚染
          sortOrder: NaN,
        },
      ];
      // 例外が発生せず、結果は2件で sortOrder が連番になること
      expect(() => repairCorruptedGroupRoutines(routines)).not.toThrow();
      const result = repairCorruptedGroupRoutines(routines);
      expect(result).toHaveLength(2);
      const sortOrders = result.map((r) => r.sortOrder);
      // assignSortOrder により 0, 1 の連番になる
      expect(sortOrders).toEqual([0, 1]);
    });
  });
});
