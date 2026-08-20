import { type Routine, type RoutinePreset } from "@/types/routine";

export const createPreset = (
  overrides?: Partial<RoutinePreset>,
): RoutinePreset => ({
  id: "preset1",
  name: "モーニングルーティン",
  routineTemplates: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

export const sampleRoutines: Routine[] = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life",
    daysOfWeek: [1, 2, 3],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

/** 選択リスト系テスト用のルーティン。既定値は「月曜 07:00 の朝食（生活）」 */
export const createRoutineFixture = (
  overrides: Partial<Routine> = {},
): Routine => ({
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
