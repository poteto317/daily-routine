import type { Routine } from "@/types/routine";
import { resolveCreateFilterSelection } from "../presetCreateFilterSelection";

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "routine-1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("resolveCreateFilterSelection", () => {
  it("作成フィルター曜日を追加すると該当ルーティンを選択する", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r1", title: "朝食", daysOfWeek: [1] }),
        createRoutine({ id: "r2", title: "運動", daysOfWeek: [2] }),
      ],
      createFilterDays: new Set<number>(),
      selectedRoutines: new Set<string>(),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([1]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r1"]);
  });

  it("作成フィルター曜日を解除すると他曜日でカバーされない選択だけ外す", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r1", title: "朝食", daysOfWeek: [1, 2] }),
        createRoutine({ id: "r2", title: "運動", daysOfWeek: [1] }),
      ],
      createFilterDays: new Set<number>([1, 2]),
      selectedRoutines: new Set<string>(["r1", "r2"]),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([2]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r1"]);
  });

  it("title・startTimeが一致する複数曜日分のルーティンは代表id1つだけを選択する", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r-mon", daysOfWeek: [1] }),
        createRoutine({ id: "r-wed", daysOfWeek: [3] }),
        createRoutine({ id: "r-fri", daysOfWeek: [5] }),
      ],
      createFilterDays: new Set<number>(),
      selectedRoutines: new Set<string>(),
      day: 1,
    });

    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r-mon"]);
  });

  it("統合グループが他曜日でカバーされなくなったらグループ内の全idを解除する", () => {
    // title・startTime・daysOfWeekが完全に一致する重複レコード（同日に誤って
    // 複数回作成された想定）が1グループに統合された場合、フィルター解除で
    // 非対象になった際にグループ内の全idが選択から外れることを検証する。
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r-a", daysOfWeek: [1] }),
        createRoutine({ id: "r-b", daysOfWeek: [1] }),
      ],
      createFilterDays: new Set<number>([1]),
      selectedRoutines: new Set<string>(["r-a", "r-b"]),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual([]);
  });

  it("統合グループが他曜日でまだカバーされていれば代表idの選択を維持する", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r-mon", daysOfWeek: [1] }),
        createRoutine({ id: "r-wed", daysOfWeek: [3] }),
        createRoutine({ id: "r-fri", daysOfWeek: [5] }),
      ],
      createFilterDays: new Set<number>([1, 3, 5]),
      selectedRoutines: new Set<string>(["r-mon"]),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([3, 5]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r-mon"]);
  });
});
