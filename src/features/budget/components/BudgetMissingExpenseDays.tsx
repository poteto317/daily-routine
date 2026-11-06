import { useId } from "react";
import {
  formatMissingDayFullLabel,
  formatMissingDayLabel,
} from "../utils/missingExpenseDates";
import budgetTexts from "../locales/ja.json";

type BudgetMissingExpenseDaysProps = {
  /** 未入力の日（昇順の "YYYY-MM-DD"） */
  dates: string[];
  /** 日付のボタンを押したとき、その日付で呼ぶ */
  onSelectDate: (date: string) => void;
};

/**
 * 家計簿トップに出す「未入力の日」の欄。今月の今日より前で支出の記録（0 円を含む）が
 * 無い日を日付のボタンで並べ、押すとその日付で支出の入力フォームを開く。
 * 未入力の日が無いときは欄ごと出さない。
 */
export const BudgetMissingExpenseDays = ({
  dates,
  onSelectDate,
}: BudgetMissingExpenseDaysProps) => {
  const headingId = useId();

  if (dates.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="bg-amber-50 dark:bg-amber-100 rounded-xl p-4 mb-6"
    >
      <h3
        id={headingId}
        className="font-bold text-amber-800 dark:text-amber-900 mb-1"
      >
        {budgetTexts.missingDays.titleTemplate.replace(
          "{count}",
          String(dates.length),
        )}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-700 mb-3">
        {budgetTexts.missingDays.description}
      </p>
      <ul className="flex flex-wrap gap-2">
        {dates.map((date) => (
          <li key={date}>
            <button
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={budgetTexts.missingDays.selectDateLabel.replace(
                "{date}",
                formatMissingDayFullLabel(date),
              )}
              className="min-h-11 px-3 py-2 rounded-full border border-amber-300 dark:border-amber-500 bg-white dark:bg-white text-sm text-amber-800 dark:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatMissingDayLabel(date)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
