import {
  groupRoutinesByGroupId,
  repairCorruptedGroupRoutines,
} from "../routineGroupRepairModel";
import {
  CREATED_AT,
  FIXED_NOW,
  makeRoutine,
  pick,
  setupFixedClockAndSequentialUuid,
} from "./routineGroup.test-utils";

describe("routineGroupRepairModel", () => {
  const { randomUuidSpy } = setupFixedClockAndSequentialUuid();

  describe("groupRoutinesByGroupId", () => {
    it("groupId ごとに最初に現れた順でまとめ、groupId が無い（空文字を含む）ものは別に分ける", () => {
      const a1 = makeRoutine({ id: "a1", groupId: "a" });
      const b1 = makeRoutine({ id: "b1", groupId: "b" });
      const a2 = makeRoutine({ id: "a2", groupId: "a" });
      const free = makeRoutine({ id: "free" });
      const emptyGroup = makeRoutine({ id: "empty", groupId: "" });

      const { groups, nonGrouped } = groupRoutinesByGroupId([
        a1,
        free,
        b1,
        a2,
        emptyGroup,
      ]);

      expect([...groups.keys()]).toEqual(["a", "b"]);
      expect(groups.get("a")).toEqual([a1, a2]);
      expect(groups.get("b")).toEqual([b1]);
      expect(nonGrouped).toEqual([free, emptyGroup]);
    });

    it("空配列なら空の結果を返す", () => {
      const { groups, nonGrouped } = groupRoutinesByGroupId([]);
      expect(groups.size).toBe(0);
      expect(nonGrouped).toEqual([]);
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
      expect(randomUuidSpy()).not.toHaveBeenCalled();
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

    it("全メンバーが同じ複数曜日を持つグループは、曜日ごとに 1 件へ正規化し groupId を保つ", () => {
      const routines = [
        makeRoutine({ id: "r1", groupId: "g1", daysOfWeek: [1, 3, 5] }),
        makeRoutine({ id: "r2", groupId: "g1", daysOfWeek: [1, 3, 5] }),
        makeRoutine({ id: "r3", groupId: "g1", daysOfWeek: [1, 3, 5] }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "groupId", "daysOfWeek"])).toEqual([
        { id: "r1", groupId: "g1", daysOfWeek: [1] },
        { id: "r2", groupId: "g1", daysOfWeek: [3] },
        { id: "r3", groupId: "g1", daysOfWeek: [5] },
      ]);
    });

    it("再利用する複数曜日メンバーは sortOrder が小さいものを、id の順に関わらず先に使う", () => {
      const routines = [
        makeRoutine({
          id: "r1",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: 5,
        }),
        makeRoutine({
          id: "r2",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: 2,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "daysOfWeek"])).toEqual([
        { id: "r2", daysOfWeek: [1] },
        { id: "r1", daysOfWeek: [3] },
      ]);
    });

    it("再利用する複数曜日メンバーの completed と sortOrder が同値なら id の辞書順で割り当てる", () => {
      const routines = [
        makeRoutine({
          id: "r_b",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: 2,
        }),
        makeRoutine({
          id: "r_a",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: 2,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "daysOfWeek"])).toEqual([
        { id: "r_a", daysOfWeek: [1] },
        { id: "r_b", daysOfWeek: [3] },
      ]);
    });

    it("sortOrder が未定義や NaN の複数曜日メンバーでも例外なく、sortOrder は 0 からの連番になる", () => {
      const routines = [
        makeRoutine({
          id: "r1",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: undefined as unknown as number,
        }),
        makeRoutine({
          id: "r2",
          groupId: "g1",
          daysOfWeek: [1, 3],
          sortOrder: NaN,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "daysOfWeek", "sortOrder"])).toEqual([
        { id: "r1", daysOfWeek: [1], sortOrder: 0 },
        { id: "r2", daysOfWeek: [3], sortOrder: 1 },
      ]);
    });

    it("テンプレートの sortOrder が未定義でも、新規に作る曜日の sortOrder は有限の連番になる", () => {
      const routines = [
        makeRoutine({
          id: "r1",
          groupId: "g1",
          daysOfWeek: [1, 3, 5],
          sortOrder: undefined as unknown as number,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["daysOfWeek", "sortOrder"])).toEqual([
        { daysOfWeek: [1], sortOrder: 0 },
        { daysOfWeek: [3], sortOrder: 1 },
        { daysOfWeek: [5], sortOrder: 2 },
      ]);
    });

    it("最終の並び替えで sortOrder が同値なら id の辞書順で連番を振る", () => {
      const routines = [
        makeRoutine({
          id: "z_clean",
          groupId: "g1",
          daysOfWeek: [3],
          sortOrder: 0,
        }),
        makeRoutine({
          id: "a_clean",
          groupId: "g1",
          daysOfWeek: [1],
          sortOrder: 0,
        }),
        makeRoutine({
          id: "dirty_1",
          groupId: "g1",
          daysOfWeek: [1, 3, 5],
          sortOrder: 99,
        }),
      ];

      const repaired = repairCorruptedGroupRoutines(routines);

      expect(pick(repaired, ["id", "sortOrder"])).toEqual([
        { id: "a_clean", sortOrder: 0 },
        { id: "z_clean", sortOrder: 1 },
        { id: "dirty_1", sortOrder: 2 },
      ]);
    });
  });
});
