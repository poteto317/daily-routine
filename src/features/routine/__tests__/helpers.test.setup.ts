import { type Routine } from "@/types/routine";
import * as notificationFeature from "@/features/notification";
import * as firebaseLib from "@/lib/firebase";
import * as coreStorage from "@/lib/storage/core";
import * as settingsStorage from "@/features/settings/storage";

jest.mock("@/lib/firebase", () => ({ getFCMToken: jest.fn() }));
jest.mock("@/features/notification", () => ({
  hasNotificationPermission: jest.fn(),
}));
jest.mock("@/lib/storage/core", () => ({
  getTodayString: jest.fn(),
  toJstDay: jest.fn(),
  toJstTime: jest.fn(),
  timeToMinutes: jest.fn((time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }),
}));
jest.mock("@/features/settings/storage", () => ({ getSettings: jest.fn() }));

export const baseRoutine = {
  id: "r1",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-02-12T00:00:00.000Z",
  updatedAt: "2026-02-12T00:00:00.000Z",
} as Routine;

export const mockGetFCMToken = firebaseLib.getFCMToken as jest.MockedFunction<
  typeof firebaseLib.getFCMToken
>;
export const mockHasNotificationPermission =
  notificationFeature.hasNotificationPermission as jest.MockedFunction<
    typeof notificationFeature.hasNotificationPermission
  >;
export const mockToJstTime = coreStorage.toJstTime as jest.MockedFunction<
  typeof coreStorage.toJstTime
>;
export const mockGetTodayString =
  coreStorage.getTodayString as jest.MockedFunction<
    typeof coreStorage.getTodayString
  >;
export const mockToJstDay = coreStorage.toJstDay as jest.MockedFunction<
  typeof coreStorage.toJstDay
>;
export const mockGetSettings =
  settingsStorage.getSettings as jest.MockedFunction<
    typeof settingsStorage.getSettings
  >;

export const setupHelpersDefaults = () => {
  jest.clearAllMocks();
  mockHasNotificationPermission.mockReturnValue(true);
  mockGetTodayString.mockReturnValue("2026-02-12");
};
