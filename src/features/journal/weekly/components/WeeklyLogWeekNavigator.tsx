import journalTexts from "../../locales/ja.json";
import {
  formatWeeklyLogWeekDate,
  formatWeeklyLogWeekRange,
} from "../weeklyLogTexts";

const texts = journalTexts.weeklyLog;

type WeeklyLogWeekNavigatorProps = {
  weekStart: string;
  isCurrentWeek: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const navButtonClass =
  "shrink-0 whitespace-nowrap px-3 py-1 text-sm font-medium rounded-lg text-purple-600 hover:bg-purple-50 dark:text-purple-700 dark:hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed";

export const WeeklyLogWeekNavigator = ({
  weekStart,
  isCurrentWeek,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: WeeklyLogWeekNavigatorProps) => (
  <div className="flex items-center justify-between gap-2 mb-4">
    <button
      type="button"
      onClick={onPrevious}
      disabled={!canGoPrevious}
      className={navButtonClass}
      aria-label={texts.previousWeekLabel}
    >
      <span aria-hidden="true">{texts.previousWeekSymbol}</span>
      <span className="sr-only sm:not-sr-only"> {texts.previousWeekLabel}</span>
    </button>
    <div
      className="min-w-0 flex-1 text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-900">
        {/* 320px 程度の狭い幅では日付の途中で折り返す（折り返しを禁じると前後のボタンに重なる） */}
        {formatWeeklyLogWeekDate(weekStart)}
        <br className="sm:hidden" />
        {texts.weekTitleSuffix}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-x-2">
        <p className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-600">
          {formatWeeklyLogWeekRange(weekStart)}
        </p>
        {isCurrentWeek && (
          <span className="shrink-0 whitespace-nowrap px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-200 dark:text-purple-900">
            {texts.currentWeekBadge}
          </span>
        )}
      </div>
    </div>
    <button
      type="button"
      onClick={onNext}
      disabled={!canGoNext}
      className={navButtonClass}
      aria-label={texts.nextWeekLabel}
    >
      <span className="sr-only sm:not-sr-only">{texts.nextWeekLabel} </span>
      <span aria-hidden="true">{texts.nextWeekSymbol}</span>
    </button>
  </div>
);
