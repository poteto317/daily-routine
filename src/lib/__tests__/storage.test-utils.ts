import type { Routine } from "@/types/routine";

export const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "1",
  title: "Test Routine",
  startTime: "09:00",
  duration: 30,
  category: "work",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  description: "",
  notificationMinutes: 0,
  sortOrder: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  ...overrides,
});
