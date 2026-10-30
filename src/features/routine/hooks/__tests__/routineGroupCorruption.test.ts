import { isCorruptedGroup } from "../routineGroupCorruption";
import { makeRoutine } from "./routineGroup.test-utils";

describe("routineGroupCorruption", () => {
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
