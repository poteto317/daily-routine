import calendarTexts from "../locales/ja.json";
import { formatCalendarMonthLabel } from "../helpers";

type CalendarMonthNavigationProps = {
  month: number;
  year: number;
  onGoToToday: () => void;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
};

export const CalendarMonthNavigation = ({
  month,
  year,
  onGoToToday,
  onNextMonth,
  onPreviousMonth,
}: CalendarMonthNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPreviousMonth}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-700 dark:text-gray-800"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">
          {formatCalendarMonthLabel(year, month)}
        </h3>
        <button
          onClick={onGoToToday}
          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors"
        >
          {calendarTexts.monthNavigation.goToToday}
        </button>
      </div>

      <button
        onClick={onNextMonth}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-700 dark:text-gray-800"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
