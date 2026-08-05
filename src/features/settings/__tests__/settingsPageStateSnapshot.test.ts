import type { AppSettings } from "@/types/routine";
import { createUpdatedSettingsSnapshot } from "../state/settingsPageStateSnapshot";

const baseSettings: AppSettings = {
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 0,
  theme: "auto",
  swipeAction: "delete",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
};

describe("settingsPageStateSnapshot", () => {
  it("form と trainDelay から保存用 settings snapshot を組み立てる", () => {
    expect(
      createUpdatedSettingsSnapshot({
        form: {
          settings: baseSettings,
          durationInput: "45",
          notificationInput: "10",
          pomodoroFocusInput: "30",
          pomodoroBreakInput: "7",
          backgroundRefreshIntervalInput: "30",
        },
        trainDelay: {
          trainDelayEnabled: true,
          monitoredLines: [
            { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
          ],
        },
        visibleFeatures: {
          journal: true,
          calendar: true,
          statistics: true,
          pomodoro: true,
          worktracker: true,
          weightTracker: true,
          workoutTracker: true,
          meal: true,
          budget: true,
          weather: false,
          preset: true,
          todoLists: true,
          syncManagement: true,
          testMatrix: true,
          accountAdmin: true,
        },
      }),
    ).toEqual({
      ...baseSettings,
      defaultDurationMinutes: 45,
      defaultNotificationMinutes: 10,
      pomodoroFocusMinutes: 30,
      pomodoroBreakMinutes: 7,
      backgroundRefreshIntervalMinutes: 30,
      trainDelay: {
        enabled: true,
        monitoredLines: [
          { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
        ],
      },
      visibleFeatures: expect.objectContaining({ weather: false }),
    });
  });
});
