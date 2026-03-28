import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings/storage", () => ({
  saveSettings: jest.fn(),
  getSettings: jest.fn(() => ({
    defaultDurationMinutes: 30,
    defaultNotificationMinutes: 0,
    theme: "auto",
    swipeAction: "delete",
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
    menuOrder: [],
  })),
}));

jest.mock("../state/theme", () => ({
  applyTheme: jest.fn(),
}));

jest.mock("../state/useSettingsFormState", () => ({
  useSettingsFormState: jest.fn(),
}));

jest.mock("../state/useTrainDelayState", () => ({
  useTrainDelayState: jest.fn(),
}));

jest.mock("../state/useNotificationTestState", () => ({
  useNotificationTestState: jest.fn(),
}));

jest.mock("../state/useDataTransferState", () => ({
  useDataTransferState: jest.fn(),
}));

jest.mock("../state/featureVisibility", () => ({
  getInitialVisibleFeatures: jest.fn(),
}));

jest.mock("../state/useSettingsPersistence", () => ({
  useSettingsPersistence: jest.fn(),
}));

import { useDataTransferState } from "../state/useDataTransferState";
import { useNotificationTestState } from "../state/useNotificationTestState";
import { useSettingsFormState } from "../state/useSettingsFormState";
import { useSettingsPersistence } from "../state/useSettingsPersistence";
import { useSettingsPageState } from "../state/useSettingsPageStateCore";
import { useTrainDelayState } from "../state/useTrainDelayState";

describe("useSettingsPageStateCore", () => {
  const formState = {
    settings: {
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "auto" as const,
      swipeAction: "delete" as const,
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
    },
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
  };

  const trainDelayState = {
    trainDelayEnabled: false,
    setTrainDelayEnabled: jest.fn(),
    selectedLineInput: "",
    setSelectedLineInput: jest.fn(),
    monitoredLines: [],
    handleAddLine: jest.fn(),
    handleRemoveLine: jest.fn(),
    availableLines: [],
  };

  const notificationState = {
    notificationStatus: "idle" as const,
    debugMessage: "",
    swLogs: [],
    clearLogs: jest.fn(),
    handleTestNotification: jest.fn(),
  };

  const transferState = {
    exportStatus: "idle" as const,
    importStatus: "idle" as const,
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
    handleImport: jest.fn(),
  };

  const visibleFeatures = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsFormState as jest.Mock).mockReturnValue(formState);
    (useTrainDelayState as jest.Mock).mockReturnValue(trainDelayState);
    (useNotificationTestState as jest.Mock).mockReturnValue(notificationState);
    (useDataTransferState as jest.Mock).mockReturnValue(transferState);
    (useSettingsPersistence as jest.Mock).mockReturnValue({
      visibleFeatures,
      setVisibleFeatures: jest.fn(),
      menuOrder: [],
      setMenuOrder: jest.fn(),
    });
  });

  it("sub-state を合成して persistence hook に委譲する", () => {
    renderHook(() => useSettingsPageState());

    expect(useSettingsPersistence).toHaveBeenCalledWith({
      form: expect.objectContaining({
        settings: formState.settings,
        durationInput: formState.durationInput,
        notificationInput: formState.notificationInput,
        pomodoroFocusInput: formState.pomodoroFocusInput,
        pomodoroBreakInput: formState.pomodoroBreakInput,
      }),
      trainDelay: expect.objectContaining({
        trainDelayEnabled: trainDelayState.trainDelayEnabled,
        monitoredLines: trainDelayState.monitoredLines,
      }),
    });
  });

  it("visible features を更新できる", () => {
    const setVisibleFeatures = jest.fn();
    (useSettingsPersistence as jest.Mock).mockReturnValue({
      visibleFeatures,
      setVisibleFeatures,
      menuOrder: [],
      setMenuOrder: jest.fn(),
    });
    const { result } = renderHook(() => useSettingsPageState());

    act(() => {
      result.current.setVisibleFeatures({
        ...visibleFeatures,
        weather: false,
      });
    });

    expect(setVisibleFeatures).toHaveBeenCalledWith({
      ...visibleFeatures,
      weather: false,
    });
  });
});
