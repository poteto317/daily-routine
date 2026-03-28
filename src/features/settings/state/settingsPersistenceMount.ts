import type { MutableRefObject } from "react";
import type { AppSettings } from "@/types/routine";
import { persistUpdatedSettings } from "./settingsPageStateActions";

type PersistSettingsAfterMountArgs = {
  didMountRef: MutableRefObject<boolean>;
  updatedSettings: AppSettings | null;
  saveSettings: (settings: AppSettings) => void;
  applyTheme: (theme: AppSettings["theme"]) => void;
};

export const persistSettingsAfterMount = ({
  didMountRef,
  updatedSettings,
  saveSettings,
  applyTheme,
}: PersistSettingsAfterMountArgs): boolean => {
  if (!didMountRef.current) {
    didMountRef.current = true;
    return false;
  }

  return persistUpdatedSettings({
    updatedSettings,
    saveSettings,
    applyTheme,
  });
};