import { type Routine } from "@/types/routine";

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  saveRoutines: jest.fn(),
  getDailyProgress: jest.fn(() => null),
  saveDailyProgress: jest.fn(),
  saveDailyProgressSilently: jest.fn(),
  shouldShowRoutineToday: jest.fn(() => true),
  filterRoutinesByDayOfWeek: jest.fn((routines) => routines),
}));

jest.mock("@/lib/storage/core", () => ({
  getTodayString: jest.fn(() => "2024-01-15"),
}));

jest.mock("@/lib/holidays", () => ({
  isHoliday: jest.fn(() => false),
}));

jest.mock("@/features/notification/notification-messaging", () => ({
  scheduleNotifications: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/features/notification/notification-permission", () => ({
  hasNotificationPermission: jest.fn(() => false),
}));

jest.mock("@/features/routine/helpers", () => ({
  syncRoutinesToFirebase: jest.fn().mockResolvedValue(true),
}));

import {
  getRoutines,
  getDailyProgress,
  filterRoutinesByDayOfWeek,
  saveDailyProgress,
  saveDailyProgressSilently,
  saveRoutines,
} from "@/features/routine/storage";
import { getTodayString } from "@/lib/storage/core";

export const mockRoutine: Routine = {
  id: "1",
  title: "Test Routine",
  startTime: "09:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  description: "",
  notificationMinutes: 10,
  sortOrder: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

export const setupUseRoutinesDefaults = () => {
  jest.clearAllMocks();
  (getRoutines as jest.Mock).mockReturnValue([]);
  (getDailyProgress as jest.Mock).mockReturnValue(null);
  (getTodayString as jest.Mock).mockReturnValue("2024-01-15");
};

export {
  getRoutines,
  getDailyProgress,
  filterRoutinesByDayOfWeek,
  saveDailyProgress,
  saveDailyProgressSilently,
  saveRoutines,
};
