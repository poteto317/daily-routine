import type { Routine } from "@/types/routine";
import {
  groupRoutinesForSelection,
  sortRoutineSelectionGroupsByStartTime,
} from "../presetRoutineGrouping";

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

describe("groupRoutinesForSelection", () => {
  it("空配列なら空配列を返す", () => {
    expect(groupRoutinesForSelection([])).toEqual([]);
  });

  it("単一レコードはそのまま1グループになる", () => {
    const routine = createRoutine();
    const groups = groupRoutinesForSelection([routine]);

    expect(groups).toHaveLength(1);
    expect(groups[0].routine).toBe(routine);
    expect(groups[0].routineIds).toEqual(["routine-1"]);
    expect(groups[0].daysOfWeek).toEqual([1]);
  });

  it("title・startTimeが一致する複数レコードは1グループに統合される（曜日分割された想定）", () => {
    const mon = createRoutine({ id: "r-mon", daysOfWeek: [1] });
    const wed = createRoutine({ id: "r-wed", daysOfWeek: [3] });
    const fri = createRoutine({ id: "r-fri", daysOfWeek: [5] });

    const groups = groupRoutinesForSelection([mon, wed, fri]);

    expect(groups).toHaveLength(1);
    expect(groups[0].routine).toBe(mon);
    expect(groups[0].routineIds).toEqual(["r-mon", "r-wed", "r-fri"]);
    expect(groups[0].daysOfWeek).toEqual([1, 3, 5]);
  });

  it("代表ルーティンは配列内で最初に出現したものになる", () => {
    const first = createRoutine({ id: "r-first", daysOfWeek: [1] });
    const second = createRoutine({ id: "r-second", daysOfWeek: [2] });

    const groups = groupRoutinesForSelection([first, second]);

    expect(groups[0].routine).toBe(first);
  });

  it("titleが異なれば同じstartTimeでも別グループになる", () => {
    const a = createRoutine({ id: "a", title: "朝食" });
    const b = createRoutine({ id: "b", title: "ストレッチ" });

    const groups = groupRoutinesForSelection([a, b]);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.routineIds)).toEqual([["a"], ["b"]]);
  });

  it("startTimeが異なれば同じtitleでも別グループになる", () => {
    const a = createRoutine({ id: "a", startTime: "07:00" });
    const b = createRoutine({ id: "b", startTime: "08:00" });

    const groups = groupRoutinesForSelection([a, b]);

    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.routineIds)).toEqual([["a"], ["b"]]);
  });

  it("daysOfWeekの和集合は重複を除いた値になる", () => {
    const a = createRoutine({ id: "a", daysOfWeek: [1, 2] });
    const b = createRoutine({ id: "b", daysOfWeek: [2, 3] });

    const groups = groupRoutinesForSelection([a, b]);

    expect(groups).toHaveLength(1);
    expect(groups[0].daysOfWeek).toEqual([1, 2, 3]);
  });
});

describe("sortRoutineSelectionGroupsByStartTime", () => {
  it("startTimeの昇順に並べ替える", () => {
    const late = createRoutine({
      id: "late",
      title: "夜食",
      startTime: "22:00",
    });
    const early = createRoutine({
      id: "early",
      title: "朝食",
      startTime: "06:00",
    });
    const middle = createRoutine({
      id: "middle",
      title: "昼食",
      startTime: "12:00",
    });

    const groups = groupRoutinesForSelection([late, early, middle]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((group) => group.routine.id)).toEqual([
      "early",
      "middle",
      "late",
    ]);
  });

  it("1桁時刻もゼロ埋めされた文字列として正しく並ぶ", () => {
    // 数値ではなく文字列で比較するため、"9:00" のような表記が混ざると
    // 並びが壊れる。保存時は必ず HH:mm のゼロ埋めになっている前提を固定する
    const nine = createRoutine({
      id: "nine",
      title: "朝礼",
      startTime: "09:00",
    });
    const ten = createRoutine({ id: "ten", title: "会議", startTime: "10:00" });

    const groups = groupRoutinesForSelection([ten, nine]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((group) => group.routine.id)).toEqual(["nine", "ten"]);
  });

  it("startTimeが同じ場合は元の順序を維持する", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "07:00" });

    const groups = groupRoutinesForSelection([a, b]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((group) => group.routine.id)).toEqual(["a", "b"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortRoutineSelectionGroupsByStartTime([])).toEqual([]);
  });

  it("引数の配列を破壊的に変更しない", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "20:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "05:00" });
    const groups = groupRoutinesForSelection([a, b]);
    const originalOrder = groups.map((group) => group.routine.id);

    sortRoutineSelectionGroupsByStartTime(groups);

    expect(groups.map((group) => group.routine.id)).toEqual(originalOrder);
  });

  it("グループの中身（統合されたid・曜日）はそのまま保つ", () => {
    const mon = createRoutine({ id: "r-mon", daysOfWeek: [1] });
    const wed = createRoutine({ id: "r-wed", daysOfWeek: [3] });
    const other = createRoutine({
      id: "other",
      title: "夜食",
      startTime: "22:00",
    });

    const groups = groupRoutinesForSelection([other, mon, wed]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted[0].routineIds).toEqual(["r-mon", "r-wed"]);
    expect(sorted[0].daysOfWeek).toEqual([1, 3]);
  });
});
