import type { AppSettings } from "@/types/routine";
import type { VisibleFeaturesState } from "./featureVisibility";
import type { MonitoredLine } from "./constants";

type ParsedSettingsNumbers = {
  defaultDurationMinutes: number;
  defaultNotificationMinutes: number;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
};

type BuildUpdatedSettingsArgs = {
  settings: AppSettings;
  durationInput: string;
  notificationInput: string;
  pomodoroFocusInput: string;
  pomodoroBreakInput: string;
  trainDelayEnabled: boolean;
  monitoredLines: MonitoredLine[];
  visibleFeatures: VisibleFeaturesState;
  menuOrder?: string[];
};

type PersistUpdatedSettingsArgs = {
  updatedSettings: AppSettings | null;
  saveSettings: (settings: AppSettings) => void;
  applyTheme: (theme: AppSettings["theme"]) => void;
};

export const parseSettingNumber = (
  value: string,
  min: number,
  max: number,
): number | null => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
};

export const parseSettingsNumbers = (
  durationInput: string,
  notificationInput: string,
  pomodoroFocusInput: string,
  pomodoroBreakInput: string,
): ParsedSettingsNumbers | null => {
  const defaultDurationMinutes = parseSettingNumber(durationInput, 1, 1440);
  const defaultNotificationMinutes = parseSettingNumber(notificationInput, 0, 120);
  const pomodoroFocusMinutes = parseSettingNumber(pomodoroFocusInput, 1, 90);
  const pomodoroBreakMinutes = parseSettingNumber(pomodoroBreakInput, 1, 30);

  if (
    defaultDurationMinutes === null ||
    defaultNotificationMinutes === null ||
    pomodoroFocusMinutes === null ||
    pomodoroBreakMinutes === null
  ) {
    return null;
  }

  return {
    defaultDurationMinutes,
    defaultNotificationMinutes,
    pomodoroFocusMinutes,
    pomodoroBreakMinutes,
  };
};

export const buildUpdatedSettings = ({
  settings,
  durationInput,
  notificationInput,
  pomodoroFocusInput,
  pomodoroBreakInput,
  trainDelayEnabled,
  monitoredLines,
  visibleFeatures,
  menuOrder,
}: BuildUpdatedSettingsArgs): AppSettings | null => {
  const parsedNumbers = parseSettingsNumbers(
    durationInput,
    notificationInput,
    pomodoroFocusInput,
    pomodoroBreakInput,
  );

  if (!parsedNumbers) {
    return null;
  }

  return {
    ...settings,
    ...parsedNumbers,
    trainDelay: {
      enabled: trainDelayEnabled,
      monitoredLines,
    },
    visibleFeatures,
    ...(menuOrder !== undefined && { menuOrder }),
  };
};

export const persistUpdatedSettings = ({
  updatedSettings,
  saveSettings,
  applyTheme,
}: PersistUpdatedSettingsArgs): boolean => {
  if (!updatedSettings) {
    return false;
  }

  saveSettings(updatedSettings);
  applyTheme(updatedSettings.theme);
  return true;
};

export type { ParsedSettingsNumbers };
