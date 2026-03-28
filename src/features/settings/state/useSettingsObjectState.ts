import { useState } from "react";
import type { AppSettings } from "@/types/routine";
import { createSettingsObjectStateResult } from "./settingsObjectStateResult";

type SettingsObjectInitialState = {
  settings: AppSettings;
};

export const useSettingsObjectState = (
  initialState: SettingsObjectInitialState,
) => {
  const [settings, setSettings] = useState<AppSettings>(initialState.settings);

  return createSettingsObjectStateResult({
    setSettings,
    settings,
  });
};
