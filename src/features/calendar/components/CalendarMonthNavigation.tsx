import calendarTexts from "../locales/ja.json";
import { formatCalendarMonthLabel } from "../helpers";
import { PeriodNavButton } from "@/components";

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
      <PeriodNavButton
        direction="previous"
        onClick={onPreviousMonth}
        ariaLabel={undefined}
        type={undefined}
      />

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

      <PeriodNavButton
        direction="next"
        onClick={onNextMonth}
        ariaLabel={undefined}
        type={undefined}
      />
    </div>
  );
};
