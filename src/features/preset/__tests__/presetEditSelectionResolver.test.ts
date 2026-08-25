import type { Routine, RoutineTemplate } from "@/types/routine";
import {
  findOrphanedRoutineTemplates,
  resolveEditSelectedRoutineIds,
} from "../presetEditSelectionResolver";

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

describe("resolveEditSelectedRoutineIds", () => {
  it("テンプレートに対応する現在のルーティンidを選択済みにする", () => {
    const selected = resolveEditSelectedRoutineIds(
      [template("朝食", "07:00"), template("運動", "07:30")],
      [
        createRoutine({ id: "r1", title: "朝食", startTime: "07:00" }),
        createRoutine({ id: "r2", title: "運動", startTime: "07:30" }),
        createRoutine({ id: "r3", title: "無関係", startTime: "09:00" }),
      ],
    );

    expect(Array.from(selected).sort()).toEqual(["r1", "r2"]);
  });

  it("曜日分割された重複ルーティンは代表idだけを選択する", () => {
    const selected = resolveEditSelectedRoutineIds(
      [template("朝食", "07:00")],
      [
        createRoutine({ id: "r-mon", daysOfWeek: [1] }),
        createRoutine({ id: "r-wed", daysOfWeek: [3] }),
        createRoutine({ id: "r-fri", daysOfWeek: [5] }),
      ],
    );

    expect(Array.from(selected)).toEqual(["r-mon"]);
  });

  it("対応する現在のルーティンが無いテンプレートは選択対象にならない", () => {
    const selected = resolveEditSelectedRoutineIds(
      [template("削除済み", "08:00")],
      [createRoutine({ id: "r1", title: "朝食", startTime: "07:00" })],
    );

    expect(selected.size).toBe(0);
  });

  it("テンプレートが空なら空のSetを返す", () => {
    expect(resolveEditSelectedRoutineIds([], [createRoutine()]).size).toBe(0);
  });
});

describe("findOrphanedRoutineTemplates", () => {
  it("現在のルーティンに存在しないテンプレートだけを返す", () => {
    const orphaned = findOrphanedRoutineTemplates(
      [
        template("朝食", "07:00"),
        template("削除済み", "08:00"),
        template("運動", "07:30"),
      ],
      [
        createRoutine({ id: "r1", title: "朝食", startTime: "07:00" }),
        createRoutine({ id: "r2", title: "運動", startTime: "07:30" }),
      ],
    );

    expect(orphaned).toHaveLength(1);
    expect(orphaned[0].title).toBe("削除済み");
  });

  it("すべて現在のルーティンに存在すれば空配列を返す", () => {
    const orphaned = findOrphanedRoutineTemplates(
      [template("朝食", "07:00")],
      [createRoutine({ id: "r1", title: "朝食", startTime: "07:00" })],
    );

    expect(orphaned).toEqual([]);
  });

  it("startTimeだけが異なる場合は別物として扱う", () => {
    const orphaned = findOrphanedRoutineTemplates(
      [template("朝食", "08:00")],
      [createRoutine({ id: "r1", title: "朝食", startTime: "07:00" })],
    );

    expect(orphaned).toHaveLength(1);
  });
});
