import { type AppSettings } from "@/types/routine";

type ThemeMode = AppSettings["theme"];
type SwipeAction = AppSettings["swipeAction"];

export type ThemeOption = {
  value: ThemeMode;
  title: string;
  description: string;
};

export type SwipeActionOption = {
  value: SwipeAction;
  title: string;
  description: string;
};

export const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", title: "ライトモード", description: "常に明るいテーマ" },
  { value: "dark", title: "ダークモード", description: "常に暗いテーマ" },
  {
    value: "auto",
    title: "自動",
    description: "システムの設定に従う",
  },
];

export const SWIPE_ACTION_OPTIONS: SwipeActionOption[] = [
  {
    value: "delete",
    title: "🗑️ 削除",
    description: "スワイプでルーティンを削除",
  },
  {
    value: "edit",
    title: "✏️ 編集",
    description: "スワイプで編集画面を開く",
  },
];

export const getUpdatedSettingsForSwipeAction = (
  settings: AppSettings,
  swipeAction: SwipeAction,
): AppSettings => {
  return { ...settings, swipeAction };
};
