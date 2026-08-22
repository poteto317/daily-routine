import texts from "../locales/ja.json";

export const WEIGHT_TRACKER_PAGE_TEXT = {
  title: texts.page.title,
} as const;

export const WEIGHT_TRACKER_MESSAGES = {
  alertInvalidWeight: texts.page.alertInvalidWeight,
  confirmDeleteTemplate: (date: string) =>
    texts.page.confirmDeleteTemplate.replace("{date}", date),
} as const;
