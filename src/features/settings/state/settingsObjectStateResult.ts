import type { Dispatch, SetStateAction } from "react";
import type { AppSettings } from "@/types/routine";

type SettingsObjectStateResultInput = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};

export const createSettingsObjectStateResult = ({
  settings,
  setSettings,
}: SettingsObjectStateResultInput) => ({
  settings,
  setSettings,
});
