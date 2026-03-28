import { type Routine } from "@/types/routine";

jest.mock("@/lib/firebase", () => ({
  getFCMToken: jest.fn(() => Promise.resolve("mock-token")),
}));

jest.mock("@/features/routine/helpers", () => ({
  ...jest.requireActual("@/features/routine/helpers"),
  syncRoutinesToFirebase: jest.fn(() => Promise.resolve(true)),
  getCategoryInfo: jest.fn((routine) => ({
    emoji: "💪",
    label: "健康",
    value: routine.category,
  })),
}));

jest.mock("@/lib/storage/core", () => ({
  getCurrentTime: jest.fn(() => "12:00"),
  timeToMinutes: jest.fn((time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }),
}));
jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(() => ({
    swipeAction: "delete" as const,
    defaultNotificationMinutes: 10,
    defaultDurationMinutes: 30,
  })),
}));

export const mockRoutine: Routine = {
  id: "1",
  title: "テストルーティン",
  startTime: "09:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  description: "これはテストです",
  notificationMinutes: 10,
  sortOrder: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

export const mockOnToggle = jest.fn();
export const mockOnEdit = jest.fn();
export const mockOnDelete = jest.fn();

export const resetRoutineItemMocks = () => {
  jest.clearAllMocks();
};
