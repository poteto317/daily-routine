import type { Routine, RoutinePreset, RoutineTemplate } from "@/types/routine";
import { resolveUpdatedRoutineTemplates } from "../presetTemplateMergePolicy";

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

const template = (title: string, startTime: string): RoutineTemplate => ({
  title,
  startTime,
  duration: 30,
  category: "life",
});

const createPreset = (routineTemplates: RoutineTemplate[]): RoutinePreset => ({
  id: "preset-1",
  name: "朝ルーティン",
  routineTemplates,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
});

describe("resolveUpdatedRoutineTemplates", () => {
  it("選択されたルーティンからテンプレートを生成する", () => {
    const routine = createRoutine({ title: "朝食", startTime: "07:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([template("朝食", "07:00")]),
      routinesToSave: [routine],
      currentRoutines: [routine],
    });

    expect(result.map((t) => t.title)).toEqual(["朝食"]);
  });

  it("元のルーティンが削除済みのテンプレートは保持する", () => {
    const routine = createRoutine({ title: "朝食", startTime: "07:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([
        template("朝食", "07:00"),
        template("英語学習", "08:00"),
      ]),
      routinesToSave: [routine],
      currentRoutines: [routine],
    });

    // 削除済みの「英語学習」もプリセット内の元の位置のまま保持される
    expect(result.map((t) => t.title)).toEqual(["朝食", "英語学習"]);
  });

  it("プリセットの並び順を維持する（一覧表示順・適用時のsortOrderに影響するため）", () => {
    // ユーザーが意図的にC→A→Bの順で並べたプリセットを、
    // ルーティン側の並び順(A,B,C)で上書きしてはいけない。
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "08:00" });
    const c = createRoutine({ id: "c", title: "C", startTime: "09:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([
        template("C", "09:00"),
        template("A", "07:00"),
        template("B", "08:00"),
      ]),
      routinesToSave: [a, b, c],
      currentRoutines: [a, b, c],
    });

    expect(result.map((t) => t.title)).toEqual(["C", "A", "B"]);
  });

  it("削除済みテンプレートは元の位置のまま保持する", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "08:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([
        template("A", "07:00"),
        template("削除済み", "06:00"),
        template("B", "08:00"),
      ]),
      routinesToSave: [a, b],
      currentRoutines: [a, b],
    });

    expect(result.map((t) => t.title)).toEqual(["A", "削除済み", "B"]);
  });

  it("新たに選択されたテンプレートは末尾に追加する", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "08:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([template("A", "07:00")]),
      routinesToSave: [a, b],
      currentRoutines: [a, b],
    });

    expect(result.map((t) => t.title)).toEqual(["A", "B"]);
  });

  it("選択から外されたテンプレートは取り除く", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "08:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([template("A", "07:00"), template("B", "08:00")]),
      routinesToSave: [a],
      currentRoutines: [a, b],
    });

    expect(result.map((t) => t.title)).toEqual(["A"]);
  });

  it("選択が空でも削除済みテンプレートがあれば保持する", () => {
    const routine = createRoutine({ title: "朝食", startTime: "07:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([template("英語学習", "08:00")]),
      routinesToSave: [],
      currentRoutines: [routine],
    });

    expect(result.map((t) => t.title)).toEqual(["英語学習"]);
  });

  it("選択・削除済みともに空なら既存テンプレートを維持する", () => {
    const preset = createPreset([]);

    expect(
      resolveUpdatedRoutineTemplates({
        preset,
        routinesToSave: [],
        currentRoutines: [createRoutine()],
      }),
    ).toBe(preset.routineTemplates);
  });

  it("削除済みが無ければ選択分だけを返す", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });

    const result = resolveUpdatedRoutineTemplates({
      preset: createPreset([template("A", "07:00")]),
      routinesToSave: [a],
      currentRoutines: [a],
    });

    expect(result.map((t) => t.title)).toEqual(["A"]);
  });
});
