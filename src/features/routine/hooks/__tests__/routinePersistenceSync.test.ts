import type { Routine } from "@/types/routine";
import { setCurrentUserId } from "@/lib/storage/core";
import { saveRoutines } from "@/features/routine/storage";
import {
  createNotificationSchedules,
  scheduleNotifications,
} from "@/features/notification";
import { syncRoutinesToFirebase } from "../../helpers";
import {
  saveAndSyncRoutines,
  syncRoutines,
  updateNotificationSchedules,
} from "../routinePersistenceSync";

jest.mock("@/features/routine/storage", () => ({
  saveRoutines: jest.fn(),
}));

jest.mock("@/features/notification", () => ({
  createNotificationSchedules: jest.fn(() => [{ id: "s1" }]),
  scheduleNotifications: jest.fn().mockResolvedValue(true),
}));

jest.mock("../../helpers", () => ({
  syncRoutinesToFirebase: jest.fn().mockResolvedValue(true),
}));

describe("routinePersistenceSync", () => {
  const routines: Routine[] = [
    {
      id: "r1",
      title: "朝活",
      startTime: "08:00",
      duration: 30,
      category: "health",
      daysOfWeek: [1],
      isCompleted: true,
      sortOrder: 0,
      createdAt: "2026-02-13T00:00:00.000Z",
      updatedAt: "2026-02-13T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    setCurrentUserId("routine-owner");
  });

  it("syncRoutinesはFirebase同期ヘルパーを呼ぶ", async () => {
    await syncRoutines(routines, "https://functions.example.com");

    expect(syncRoutinesToFirebase).toHaveBeenCalledWith(
      routines,
      "https://functions.example.com",
      "routine-owner",
    );
  });

  it("saveAndSyncRoutinesは完了状態を除いて保存し同期する", async () => {
    saveAndSyncRoutines(routines, "https://functions.example.com");
    await Promise.resolve();

    expect(saveRoutines).toHaveBeenCalledWith([
      expect.objectContaining({ id: "r1", isCompleted: false }),
    ]);
    expect(syncRoutinesToFirebase).toHaveBeenCalledWith(
      routines,
      "https://functions.example.com",
      "routine-owner",
    );
  });

  it("saveAndSyncRoutinesはルーティン保存後にカスタムイベントを発火する", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    saveAndSyncRoutines(routines);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "routines-saved" }),
    );
    dispatchSpy.mockRestore();
  });

  it("saveAndSyncRoutinesは同期失敗を内部で吸収する", async () => {
    (syncRoutinesToFirebase as jest.Mock).mockRejectedValueOnce(
      new Error("sync failed"),
    );

    expect(() => saveAndSyncRoutines(routines)).not.toThrow();
    await Promise.resolve();
  });

  it("旧画面のコールバックは別ユーザーのローカルに保存しない", () => {
    saveAndSyncRoutines(
      routines,
      "https://functions.example.com",
      "previous-owner",
    );
    expect(saveRoutines).not.toHaveBeenCalled();
    expect(syncRoutinesToFirebase).not.toHaveBeenCalled();
  });

  it("updateNotificationSchedulesは通知スケジュール作成と送信を行う", async () => {
    await updateNotificationSchedules(routines);

    expect(createNotificationSchedules).toHaveBeenCalledWith(routines);
    expect(scheduleNotifications).toHaveBeenCalledWith([{ id: "s1" }]);
  });
});
