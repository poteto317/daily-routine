import { Routine, RoutinePreset } from "@/types/routine";

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
