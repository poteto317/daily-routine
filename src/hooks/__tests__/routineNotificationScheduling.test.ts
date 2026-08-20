import { scheduleRoutineNotificationsIfPermitted } from "../routineNotificationScheduling";
import {
  createNotificationSchedules,
  hasNotificationPermission,
  scheduleNotifications,
} from "@/features/notification";
import { getRoutines } from "@/lib/storage";

jest.mock("@/features/notification", () => ({
  createNotificationSchedules: jest.fn(),
  hasNotificationPermission: jest.fn(),
  scheduleNotifications: jest.fn(),
}));
jest.mock("@/lib/storage", () => ({ getRoutines: jest.fn() }));

const mockHasPermission = hasNotificationPermission as jest.Mock;
const mockCreate = createNotificationSchedules as jest.Mock;
const mockSchedule = scheduleNotifications as jest.Mock;
const mockGetRoutines = getRoutines as jest.Mock;

describe("scheduleRoutineNotificationsIfPermitted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRoutines.mockReturnValue([]);
    mockCreate.mockReturnValue([]);
  });

  it("許可が無ければ何もしない", () => {
    mockHasPermission.mockReturnValue(false);

    return scheduleRoutineNotificationsIfPermitted().then(() => {
      expect(mockGetRoutines).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockSchedule).not.toHaveBeenCalled();
    });
  });

  it("許可があれば保存済みルーティンから予定を作って登録する", async () => {
    mockHasPermission.mockReturnValue(true);
    mockGetRoutines.mockReturnValue([{ id: "r1" }]);
    mockCreate.mockReturnValue([{ id: "s1" }]);

    await scheduleRoutineNotificationsIfPermitted();

    expect(mockCreate).toHaveBeenCalledWith([{ id: "r1" }]);
    expect(mockSchedule).toHaveBeenCalledWith([{ id: "s1" }]);
  });

  it("予定が0件なら登録しない", async () => {
    // 空配列を送ると、Service Worker 側で登録済みの予定を消してしまう
    mockHasPermission.mockReturnValue(true);
    mockCreate.mockReturnValue([]);

    await scheduleRoutineNotificationsIfPermitted();

    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
