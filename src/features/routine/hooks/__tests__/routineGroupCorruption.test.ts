import type { Routine } from "@/types/routine";

import {
  groupRoutinesByGroupId,
  isCorruptedGroup,
} from "../routineGroupCorruption";

const makeRoutine = (overrides: Partial<Routine>): Routine => ({
  id: "r",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-02-13T00:00:00.000Z",
  updatedAt: "2026-02-13T00:00:00.000Z",
  ...overrides,
});

describe("routineGroupCorruption", () => {
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

  describe("isCorruptedGroup", () => {
    it("曜日が重ならない単一曜日のメンバーだけなら汚染ではない", () => {
      expect(
        isCorruptedGroup([
          makeRoutine({ id: "a", daysOfWeek: [0] }),
          makeRoutine({ id: "b", daysOfWeek: [6] }),
        ]),
      ).toBe(false);
    });

    it("曜日が空のメンバーは汚染とみなさない", () => {
      expect(isCorruptedGroup([makeRoutine({ daysOfWeek: [] })])).toBe(false);
    });

    it("複数曜日を持つメンバーがいれば汚染とみなす", () => {
      expect(isCorruptedGroup([makeRoutine({ daysOfWeek: [1, 2] })])).toBe(
        true,
      );
    });

    it("同じ曜日のメンバーが重複していれば汚染とみなす", () => {
      expect(
        isCorruptedGroup([
          makeRoutine({ id: "a", daysOfWeek: [3] }),
          makeRoutine({ id: "b", daysOfWeek: [3] }),
        ]),
      ).toBe(true);
    });
  });
});
