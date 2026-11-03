import journalTexts from "./locales/ja.json";
import { formatJournalDate, isValidJournalDate } from "./utils/journalDate";

export const confirmDeleteEntry = (date: string): string =>
  journalTexts.page.confirmDeleteEntryTemplate.replace("{date}", date);

export const getJournalFormOpenButtonLabel = (): string => {
  return journalTexts.todayCard.addButtonLabel;
};

/**
 * 今日のカードの見出し。date が今日なら「今日の記録 (日付)」、今日以外なら「<日付> の記録」。
 * 日付欄の値が空・不正なら日付を出さず「今日の記録」だけにする（Invalid Date を出さない）。
 */
export const getJournalTodayCardHeading = (
  date: string,
  today: string,
): string => {
  const { titleLabel, dateEntryTitleTemplate } = journalTexts.todayCard;

  if (!isValidJournalDate(date)) return titleLabel;
  if (date === today) return `${titleLabel} (${formatJournalDate(today)})`;
  return dateEntryTitleTemplate.replace("{date}", formatJournalDate(date));
};
