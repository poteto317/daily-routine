import type { Routine } from "@/types/routine";
import {
  hasInvalidReorderTargets,
  hasStaleReorderSchedule,
} from "../routineReorderRequestValidation";

const createRoutine = (
  id: string,
  startTime: string,
  duration: number,
): Routine => ({
  id,
  title: id,
  startTime,
  duration,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
});

describe("routineReorderRequestValidation", () => {
  const routines = [
    createRoutine("a", "19:00", 30),
    createRoutine("b", "19:30", 20),
  ];

  it("現在・並び替え前・並び替え後の対象IDが一致する場合は有効と判定する", () => {
    expect(
      hasInvalidReorderTargets(routines, [routines[1], routines[0]], routines),
    ).toBe(false);
  });

  it("並び替え後の対象に重複IDが含まれる場合は不正と判定する", () => {
    expect(
      hasInvalidReorderTargets(routines, [routines[0], routines[0]], routines),
    ).toBe(true);
  });

  it("並び替え前の対象に重複IDが含まれる場合は不正と判定する", () => {
    expect(
      hasInvalidReorderTargets(
        routines,
        [routines[1], routines[0]],
        [routines[0], routines[0]],
      ),
    ).toBe(true);
  });

  it("現在のstateに存在しない対象IDが含まれる場合は不正と判定する", () => {
    const unknown = createRoutine("unknown", "20:00", 10);

    expect(
      hasInvalidReorderTargets(routines, [routines[0], unknown], routines),
    ).toBe(true);
  });

  it("ドラッグ中にdurationが変わった場合は古いスケジュールと判定する", () => {
    const source = [createRoutine("a", "19:00", 30)];
    const current = [{ ...source[0], duration: 20 }];

    expect(hasStaleReorderSchedule(current, source)).toBe(true);
  });

  it("同じ時刻集合でもIDごとの開始時刻が変わった場合は古いスケジュールと判定する", () => {
    const source = [
      createRoutine("a", "07:00", 30),
      createRoutine("b", "08:00", 30),
      createRoutine("c", "09:00", 30),
    ];
    const current = [
      { ...source[0], startTime: "09:00" },
      { ...source[1], startTime: "07:00" },
      { ...source[2], startTime: "08:00" },
    ];

    expect(hasStaleReorderSchedule(current, source)).toBe(true);
  });

  it("スケジュール以外のフィールドだけが変わった場合は古いと判定しない", () => {
    const source = [createRoutine("a", "19:00", 30)];
    const current = [{ ...source[0], title: "更新後タイトル" }];

    expect(hasStaleReorderSchedule(current, source)).toBe(false);
  });
});
