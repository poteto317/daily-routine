import type { AppSettings } from "@/types/routine";
import { createSettingsPageStateResult } from "../state/settingsPageStateResult";

const baseSettings: AppSettings = {
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 0,
  theme: "auto",
  swipeAction: "delete",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
};

describe("settingsPageStateResult", () => {
  it("page state result に各 feature state を統合する", () => {
    const result = createSettingsPageStateResult({
      form: {
        settings: baseSettings,
        setSettings: jest.fn(),
        durationInput: "30",
        setDurationInput: jest.fn(),
        notificationInput: "0",
        setNotificationInput: jest.fn(),
        pomodoroFocusInput: "25",
        setPomodoroFocusInput: jest.fn(),
        pomodoroBreakInput: "5",
        setPomodoroBreakInput: jest.fn(),
        handleThemeChange: jest.fn(),
      },
      trainDelay: {
        trainDelayEnabled: false,
        setTrainDelayEnabled: jest.fn(),
        selectedLineInput: "",
        setSelectedLineInput: jest.fn(),
        monitoredLines: [],
        availableLines: [],
        handleAddLine: jest.fn(),
        handleRemoveLine: jest.fn(),
      },
      notification: {
        notificationStatus: "idle",
        debugMessage: "",
        swLogs: [],
        clearLogs: jest.fn(),
        handleTestNotification: jest.fn(),
      },
      transfer: {
        exportStatus: "idle",
        importStatus: "idle",
        exportOptions: {
          routines: true,
          progress: true,
          history: true,
          settings: true,
        },
        setExportOptions: jest.fn(),
        importOptions: {
          routines: true,
          progress: true,
          history: true,
          settings: true,
        },
        setImportOptions: jest.fn(),
        fileInputRef: { current: null },
        handleExport: jest.fn(),
        handleImportClick: jest.fn(),
        handleImport: jest.fn(async () => {}),
      },
      visibleFeatures: {
        journal: true,
        calendar: true,
        statistics: true,
        pomodoro: true,
        worktracker: true,
        weightTracker: true,
        meal: true,
        budget: true,
        weather: true,
        preset: true,
        todoLists: true,
        syncManagement: true,
        testMatrix: true,
        accountAdmin: true,
      },
      setVisibleFeatures: jest.fn(),
    });

    expect(result.settings).toBe(baseSettings);
    expect(result.notificationStatus).toBe("idle");
    expect(result.exportStatus).toBe("idle");
    expect(result.visibleFeatures.weather).toBe(true);
  });
});