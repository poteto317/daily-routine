import type { Routine } from "@/types/routine";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import {
  sortRoutineSelectionGroupsByStartTime,
  toTimeOrderedSelectionGroups,
} from "../presetRoutineSelectionOrder";
import { createRoutineFixture } from "./storageTestFixtures";

describe("sortRoutineSelectionGroupsByStartTime", () => {
  it("startTimeの昇順に並べ替える", () => {
    const late = createRoutineFixture({
      id: "late",
      title: "夜食",
      startTime: "22:00",
    });
    const early = createRoutineFixture({
      id: "early",
      title: "朝食",
      startTime: "06:00",
    });
    const middle = createRoutineFixture({
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
    const nine = createRoutineFixture({
      id: "nine",
      title: "朝礼",
      startTime: "09:00",
    });
    const ten = createRoutineFixture({
      id: "ten",
      title: "会議",
      startTime: "10:00",
    });

    const groups = groupRoutinesForSelection([ten, nine]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((group) => group.routine.id)).toEqual(["nine", "ten"]);
  });

  it("startTimeが同じ場合は元の順序を維持する", () => {
    const a = createRoutineFixture({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutineFixture({ id: "b", title: "B", startTime: "07:00" });

    const groups = groupRoutinesForSelection([a, b]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((group) => group.routine.id)).toEqual(["a", "b"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortRoutineSelectionGroupsByStartTime([])).toEqual([]);
  });

  it("引数の配列を破壊的に変更しない", () => {
    const a = createRoutineFixture({ id: "a", title: "A", startTime: "20:00" });
    const b = createRoutineFixture({ id: "b", title: "B", startTime: "05:00" });
    const groups = groupRoutinesForSelection([a, b]);
    const originalOrder = groups.map((group) => group.routine.id);

    sortRoutineSelectionGroupsByStartTime(groups);

    expect(groups.map((group) => group.routine.id)).toEqual(originalOrder);
  });

  it("グループの中身（統合されたid・曜日）はそのまま保つ", () => {
    const mon = createRoutineFixture({ id: "r-mon", daysOfWeek: [1] });
    const wed = createRoutineFixture({ id: "r-wed", daysOfWeek: [3] });
    const other = createRoutineFixture({
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

describe("toTimeOrderedSelectionGroups", () => {
  it("グループ化と時刻順の並べ替えをまとめて行う", () => {
    const groups = toTimeOrderedSelectionGroups([
      createRoutineFixture({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutineFixture({ id: "early", title: "朝食", startTime: "06:00" }),
    ]);

    expect(groups.map((group) => group.routine.id)).toEqual(["early", "late"]);
  });

  it("同じ内容の曜日違いは1グループにまとめたうえで並べる", () => {
    const groups = toTimeOrderedSelectionGroups([
      createRoutineFixture({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutineFixture({ id: "r-mon", daysOfWeek: [1] }),
      createRoutineFixture({ id: "r-wed", daysOfWeek: [3] }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].routineIds).toEqual(["r-mon", "r-wed"]);
    expect(groups[0].daysOfWeek).toEqual([1, 3]);
  });

  it("ルーティンが無ければ空配列を返す", () => {
    expect(toTimeOrderedSelectionGroups([])).toEqual([]);
  });

  it("startTime が欠けた記録が混ざっても落ちない", () => {
    // インポートは配列かどうかしか見ておらず、項目ごとの形は検証していない
    // （transferPayloadRestore の arrayField）。startTime を持たない記録が
    // 保存されうるため、並べ替えで例外を出して画面ごと壊さないようにする。
    // 比較の左右どちらに来るかで結果が変わるため、位置を変えて確かめる
    // daysOfWeek の欠損は grouping 側の別問題なので、ここでは startTime だけ落とす
    const broken = {
      id: "broken",
      title: "壊れた記録",
      daysOfWeek: [1],
    } as unknown as Routine;

    const cases: Routine[][] = [
      [broken, createRoutineFixture({ id: "ok", startTime: "07:00" })],
      [createRoutineFixture({ id: "ok", startTime: "07:00" }), broken],
      [
        createRoutineFixture({ id: "late", title: "夜", startTime: "22:00" }),
        broken,
        createRoutineFixture({ id: "early", title: "朝", startTime: "06:00" }),
      ],
    ];

    for (const routines of cases) {
      expect(() => toTimeOrderedSelectionGroups(routines)).not.toThrow();
    }
  });

  it("startTime が欠けた記録は先頭にまとめる", () => {
    const broken = {
      id: "broken",
      title: "壊れた記録",
      daysOfWeek: [1],
    } as unknown as Routine;
    const groups = toTimeOrderedSelectionGroups([
      createRoutineFixture({ id: "late", title: "夜", startTime: "22:00" }),
      broken,
      createRoutineFixture({ id: "early", title: "朝", startTime: "06:00" }),
    ]);

    expect(groups.map((group) => group.routine.id)).toEqual([
      "broken",
      "early",
      "late",
    ]);
  });
});
