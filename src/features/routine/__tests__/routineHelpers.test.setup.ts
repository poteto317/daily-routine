import { type Routine } from "@/types/routine";

jest.mock("@/lib/firebase", () => ({
  getFCMToken: jest.fn(),
}));

import { getFCMToken } from "@/lib/firebase";

export const baseRoutine: Routine = {
  id: "1",
  title: "Test",
  startTime: "09:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  description: "",
  notificationMinutes: 10,
  sortOrder: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

export const setupRoutineHelpersDefaults = () => {
  jest.clearAllMocks();
  sessionStorage.clear();
};

export const mockGetFCMToken = getFCMToken as jest.MockedFunction<
  typeof getFCMToken
>;
