import { saveSettings } from "@/features/settings/storage";
import { useEffect, useRef } from "react";
import {
  createUpdatedSettingsSnapshot,
  persistSettingsAfterMount,
  type SettingsFormState,
  type TrainDelayState,
} from "./settingsPageCoreActions";
import type { VisibleFeaturesState } from "./featureVisibility";
import { applyTheme } from "./theme";

type UseSettingsPersistenceEffectArgs = {
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
  visibleFeatures: VisibleFeaturesState;
  menuOrder: string[];
};

export const useSettingsPersistenceEffect = ({
  form,
  trainDelay,
  visibleFeatures,
  menuOrder,
}: UseSettingsPersistenceEffectArgs) => {
  const didMountRef = useRef(false);

  useEffect(() => {
    persistSettingsAfterMount({
      didMountRef,
      updatedSettings: createUpdatedSettingsSnapshot({
        form,
        trainDelay,
        visibleFeatures,
        menuOrder,
      }),
      saveSettings,
      applyTheme,
    });
  }, [form, trainDelay, visibleFeatures, menuOrder]);
};
