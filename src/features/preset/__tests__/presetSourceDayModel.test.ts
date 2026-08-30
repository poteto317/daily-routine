import type { Routine } from "@/types/routine";
import { createPresetSourceDayModel } from "../presetSourceDayModel";

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

describe("createPresetSourceDayModel", () => {
  it("8曜日の選択可否と選択曜日の時刻順プレビューを一度に導出する", () => {
    const model = createPresetSourceDayModel(
      [
        createRoutine({ id: "late", title: "夜食", startTime: "22:00" }),
        createRoutine({ id: "early", title: "朝食", startTime: "06:00" }),
        createRoutine({ id: "holiday", daysOfWeek: [7] }),
      ],
      1,
    );

    expect(model.options).toHaveLength(8);
    expect(model.selectedDay).toBe(1);
    expect(model.options[0]).toEqual({
      day: 0,
      label: "日",
      hasRoutines: false,
      isSelected: false,
      isHoliday: false,
    });
    expect(model.options[1]).toEqual({
      day: 1,
      label: "月",
      hasRoutines: true,
      isSelected: true,
      isHoliday: false,
    });
    expect(model.options[7]).toEqual({
      day: 7,
      label: "祝",
      hasRoutines: true,
      isSelected: false,
      isHoliday: true,
    });
    expect(model.selectedRoutines.map(({ id }) => id)).toEqual([
      "early",
      "late",
    ]);
  });

  it("元曜日が未選択なら候補だけを返しプレビューを空にする", () => {
    const model = createPresetSourceDayModel([createRoutine()], null);

    expect(model.options[1].hasRoutines).toBe(true);
    expect(model.selectedDay).toBeNull();
    expect(model.options.every(({ isSelected }) => !isSelected)).toBe(true);
    expect(model.selectedRoutines).toEqual([]);
  });
});
