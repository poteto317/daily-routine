import type { Routine } from "@/types/routine";
import { buildReorderedRoutineState } from "../routineReorderStateModel";

const createRoutine = (
  id: string,
  startTime: string,
  sortOrder: number,
): Routine => ({
  id,
  title: id,
  startTime,
  duration: 30,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder,
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
});

describe("buildReorderedRoutineState", () => {
  it("対象だけを新しい時刻順へ移し最新フィールドと非対象ルーティンを保持する", () => {
    const first = createRoutine("a", "07:00", 4);
    const hidden = createRoutine("hidden", "12:00", 8);
    const last = {
      ...createRoutine("b", "20:00", 2),
      title: "最新タイトル",
      isCompleted: true,
      updatedAt: "2026-08-29T12:00:00.000Z",
    };
    const current = [first, hidden, last];
    const reordered = [
      { ...last, title: "古いタイトル", startTime: "07:00" },
      { ...first, startTime: "07:30" },
    ];

    const result = buildReorderedRoutineState(current, reordered);

    expect(result).toEqual([
      {
        ...last,
        startTime: "07:00",
        sortOrder: 0,
      },
      {
        ...hidden,
        sortOrder: 1,
      },
      {
        ...first,
        startTime: "07:30",
        sortOrder: 2,
      },
    ]);
  });
});
