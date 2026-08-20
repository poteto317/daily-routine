import type { Routine } from "@/types/routine";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";

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

describe("groupRoutinesForSelection の壊れた記録への耐性", () => {
  // インポートは配列かどうかしか見ておらず、項目ごとの形は検証していない。
  // 画面ごと落ちるより、その記録を表示できる形で拾うほうがよい
  it("daysOfWeek が無くても落ちない", () => {
    const broken = { id: "broken", title: "壊れた記録", startTime: "07:00" };

    expect(() =>
      groupRoutinesForSelection([broken as unknown as Routine]),
    ).not.toThrow();
  });

  it("daysOfWeek が無い記録は曜日なしのグループになる", () => {
    const broken = {
      id: "broken",
      title: "壊れた記録",
      startTime: "07:00",
    } as unknown as Routine;

    const groups = groupRoutinesForSelection([broken]);

    expect(groups).toHaveLength(1);
    expect(groups[0].routineIds).toEqual(["broken"]);
    expect(groups[0].daysOfWeek).toEqual([]);
  });

  // getRoutines は migrateRoutineRecord で `daysOfWeek || 既定値` を通すため、
  // 欠けている場合は配列に直る。一方 truthy な非配列はそのまま通り抜けるので、
  // 実際に画面へ届くのはこちらの形になる
  it.each([
    ["数値", 5],
    ["オブジェクト", {}],
    ["true", true],
    ["文字列", "月曜"],
  ])("daysOfWeek が%s でも落ちない", (_label, daysOfWeek) => {
    const broken = {
      id: "broken",
      title: "壊れた記録",
      startTime: "07:00",
      daysOfWeek,
    } as unknown as Routine;

    expect(() => groupRoutinesForSelection([broken])).not.toThrow();
  });

  it("daysOfWeek が配列でなければ曜日なしとして扱う", () => {
    const broken = {
      id: "broken",
      title: "壊れた記録",
      startTime: "07:00",
      daysOfWeek: 5,
    } as unknown as Routine;

    const groups = groupRoutinesForSelection([broken]);

    expect(groups[0].daysOfWeek).toEqual([]);
  });

  it("同じ内容の記録が続いても daysOfWeek 欠損でまとめられる", () => {
    const first = {
      id: "a",
      title: "同じ",
      startTime: "07:00",
    } as unknown as Routine;
    const second = {
      id: "b",
      title: "同じ",
      startTime: "07:00",
      daysOfWeek: [2],
    } as unknown as Routine;

    const groups = groupRoutinesForSelection([first, second]);

    expect(groups).toHaveLength(1);
    expect(groups[0].routineIds).toEqual(["a", "b"]);
    expect(groups[0].daysOfWeek).toEqual([2]);
  });
});
