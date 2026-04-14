import { type AppSettings } from "@/types/routine";
import {
  getUpdatedSettingsForSwipeAction,
  SWIPE_ACTION_OPTIONS,
  THEME_OPTIONS,
} from "../helpers/appearance";
import texts from "../locales/ja.json";

type Props = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  handleThemeChange: (newTheme: "light" | "dark" | "auto") => void;
};

export const AppearanceSection = ({
  settings,
  setSettings,
  handleThemeChange,
}: Props) => {
  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {texts.appearance.themeLabel}
          </label>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            {texts.appearance.betaLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {texts.appearance.themeDescription}
        </p>
        <div className="space-y-2">
          {THEME_OPTIONS.map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="radio"
                name="theme"
                value={item.value}
                checked={settings.theme === item.value}
                onChange={() => handleThemeChange(item.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {texts.appearance.swipeActionLabel}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {texts.appearance.swipeActionDescription}
        </p>
        <div className="space-y-2">
          {SWIPE_ACTION_OPTIONS.map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <input
                type="radio"
                name="swipeAction"
                value={item.value}
                checked={settings.swipeAction === item.value}
                onChange={() =>
                  setSettings(
                    getUpdatedSettingsForSwipeAction(settings, item.value),
                  )
                }
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};
