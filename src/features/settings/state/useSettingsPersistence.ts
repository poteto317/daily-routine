import type {
  SettingsFormState,
  TrainDelayState,
} from "./settingsPageCoreActions";
import { useSettingsPersistenceEffect } from "./useSettingsPersistenceEffect";
import { useSettingsPersistenceState } from "./useSettingsPersistenceState";

type UseSettingsPersistenceArgs = {
  form: Pick<
    SettingsFormState,
    | "settings"
    | "durationInput"
    | "notificationInput"
    | "pomodoroFocusInput"
    | "pomodoroBreakInput"
    | "backgroundRefreshIntervalInput"
  >;
  trainDelay: Pick<TrainDelayState, "trainDelayEnabled" | "monitoredLines">;
};

export const useSettingsPersistence = ({
  form,
  trainDelay,
}: UseSettingsPersistenceArgs) => {
  const persistenceState = useSettingsPersistenceState();

  useSettingsPersistenceEffect({
    form,
    trainDelay,
    visibleFeatures: persistenceState.visibleFeatures,
    menuOrder: persistenceState.menuOrder,
  });

  return persistenceState;
};
