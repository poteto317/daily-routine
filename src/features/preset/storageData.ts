import { RoutinePreset } from "@/types/routine";
import { getUserScopedKey } from "@/lib/storage/core";

const STORAGE_KEY = "routine-presets";

export const getPresets = (): RoutinePreset[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEY));
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("プリセット取得エラー:", error);
    return [];
  }
};

export const savePresets = (presets: RoutinePreset[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      getUserScopedKey(STORAGE_KEY),
      JSON.stringify(presets),
    );
  } catch (error) {
    console.error("プリセット保存エラー:", error);
  }
};
