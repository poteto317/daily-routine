import journalTexts from "./locales/ja.json";

export const confirmDeleteEntry = (date: string): string =>
  journalTexts.page.confirmDeleteEntryTemplate.replace("{date}", date);

export const getJournalFormOpenButtonLabel = (): string => {
  return journalTexts.todayCard.addButtonLabel;
};
