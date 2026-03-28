import type { Dispatch, SetStateAction } from "react";
import type { AppSettings } from "@/types/routine";
import { applyTheme } from "./theme";

type UseSettingsThemeActionArgs = {
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};

export const useSettingsThemeAction = ({
  setSettings,
}: UseSettingsThemeActionArgs) => {
  return (newTheme: "light" | "dark" | "auto") => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      theme: newTheme,
    }));
    applyTheme(newTheme);
  };
};
