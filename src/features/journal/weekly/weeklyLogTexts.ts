import journalTexts from "../locales/ja.json";
import { addDays, toUtcDate } from "./weeklyLogWeek";

const texts = journalTexts.weeklyLog;

const formatMonthDay = (date: Date): string =>
  texts.monthDayTemplate
    .replace("{month}", String(date.getUTCMonth() + 1))
    .replace("{day}", String(date.getUTCDate()));

/** 例: 2026年11月2日（月） */
export const formatWeeklyLogWeekDate = (weekStart: string): string => {
  const date = toUtcDate(weekStart);
  return texts.weekDateTemplate
    .replace("{year}", String(date.getUTCFullYear()))
    .replace("{monthDay}", formatMonthDay(date))
    .replace("{weekday}", texts.weekdayLabels[date.getUTCDay()]);
};

/** 例: 11月2日〜11月8日（年は見出しにあるので出さない） */
export const formatWeeklyLogWeekRange = (weekStart: string): string =>
  texts.weekRangeTemplate
    .replace("{start}", formatMonthDay(toUtcDate(weekStart)))
    .replace("{end}", formatMonthDay(toUtcDate(addDays(weekStart, 6))));

/** 例: 2026年11月2日（月）開始の週（「開始の週」は週の切り替えの見出しと同じ weekTitleSuffix） */
export const formatWeeklyLogWeekTitle = (weekStart: string): string =>
  texts.weekTitleTemplate
    .replace("{date}", formatWeeklyLogWeekDate(weekStart))
    .replace("{suffix}", texts.weekTitleSuffix);

/** 一覧の「開く」ボタンの読み上げ名 */
export const buildWeeklyLogOpenAriaLabel = (weekStart: string): string =>
  texts.openButtonAriaTemplate.replace(
    "{week}",
    formatWeeklyLogWeekTitle(weekStart),
  );

/** 削除確認ダイアログの文言 */
export const buildWeeklyLogDeleteConfirmMessage = (weekStart: string): string =>
  texts.confirmDeleteTemplate.replace(
    "{week}",
    formatWeeklyLogWeekTitle(weekStart),
  );
