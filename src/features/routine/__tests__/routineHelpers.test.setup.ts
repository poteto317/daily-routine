import { type Routine } from "@/types/routine";

jest.mock("@/lib/firebase", () => ({
  getFCMToken: jest.fn(),
  getAuthInstance: jest.fn(),
  deleteFCMToken: jest.fn(),
}));

import { deleteFCMToken, getAuthInstance, getFCMToken } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";

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
  setCurrentUserId("routine-owner");
  mockAuth.currentUser = makeAuthUser("routine-owner");
  jest.mocked(getAuthInstance).mockReturnValue(mockAuth as never);
  jest.mocked(deleteFCMToken).mockResolvedValue(true);
};

export const mockGetFCMToken = getFCMToken as jest.MockedFunction<
  typeof getFCMToken
>;

export const makeAuthUser = (uid: string) => ({
  uid,
  getIdToken: jest.fn().mockResolvedValue("firebase-id-token"),
});
export const mockAuth = {
  currentUser: null as ReturnType<typeof makeAuthUser> | null,
};
