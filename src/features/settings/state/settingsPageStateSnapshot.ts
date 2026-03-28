import type { AppSettings } from "@/types/routine";
import { buildUpdatedSettings } from "./settingsPageStateActions";
import type { VisibleFeaturesState } from "./featureVisibility";
import type { MonitoredLine } from "./constants";

type CreateUpdatedSettingsSnapshotArgs = {
  form: {
    settings: AppSettings;
    durationInput: string;
    notificationInput: string;
    pomodoroFocusInput: string;
    pomodoroBreakInput: string;
  };
  trainDelay: {
    trainDelayEnabled: boolean;
    monitoredLines: MonitoredLine[];
  };
  visibleFeatures: VisibleFeaturesState;
  menuOrder?: string[];
};

export const createUpdatedSettingsSnapshot = ({
  form,
  trainDelay,
  visibleFeatures,
  menuOrder,
}: CreateUpdatedSettingsSnapshotArgs): AppSettings | null => {
  return buildUpdatedSettings({
    settings: form.settings,
    durationInput: form.durationInput,
    notificationInput: form.notificationInput,
    pomodoroFocusInput: form.pomodoroFocusInput,
    pomodoroBreakInput: form.pomodoroBreakInput,
    trainDelayEnabled: trainDelay.trainDelayEnabled,
    monitoredLines: trainDelay.monitoredLines,
    visibleFeatures,
    menuOrder,
  });
};