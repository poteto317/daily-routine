import type { ViewMode } from "./page/types";
import textsJson from "./locales/ja.json";

export const STATISTICS_PAGE_TITLE = textsJson.page.title;
export const STATISTICS_PAGE_DESCRIPTION = textsJson.page.description;

export const STATISTICS_MODE_OPTIONS = textsJson.modeSelector.options.map(
  (option) => ({
    mode: option.mode as ViewMode,
    label: option.label,
  }),
);
