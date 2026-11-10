import {
  getDailyProgress,
  getRoutines,
  getSettings,
  saveDailyProgress,
  saveRoutines,
  saveSettings,
} from "../storage";
import { type DailyProgress } from "@/types/routine";
import { createRoutine } from "./storage.test-utils";

describe("storage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("設定がない場合はデフォルト設定を返す", () => {
    const settings = getSettings();
    expect(settings.theme).toBe("light");
    expect(settings.defaultDurationMinutes).toBe(30);
  });

  it("設定の保存と取得ができる", () => {
    saveSettings({
      defaultNotificationMinutes: 20,
      defaultDurationMinutes: 45,
      theme: "dark",
      swipeAction: "edit",
      pomodoroFocusMinutes: 30,
      pomodoroBreakMinutes: 10,
      trainDelay: { enabled: false, monitoredLines: [] },
      visibleFeatures: {
        journal: true,
        weeklyLog: true,
        calendar: true,
        statistics: true,
        pomodoro: true,
        worktracker: true,
        weightTracker: true,
        workoutTracker: true,
        meal: true,
        budget: true,
        weather: true,
        preset: true,
        todoLists: true,
        syncManagement: true,
        testMatrix: true,
        accountAdmin: true,
      },
    });

    expect(getSettings().theme).toBe("dark");
  });

  it("ルーティンの保存と取得ができる", () => {
    saveRoutines([createRoutine({ title: "Saved" })]);
    expect(getRoutines()[0].title).toBe("Saved");
  });

  it("日次進捗の保存と取得ができる", () => {
    const progress: DailyProgress = {
      date: "2024-01-15",
      completedRoutineIds: ["1", "2"],
      lastResetTime: "2024-01-15T00:00:00.000Z",
    };

    saveDailyProgress(progress);
    expect(getDailyProgress()).toEqual(progress);
  });
});
