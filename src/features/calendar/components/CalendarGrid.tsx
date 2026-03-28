import { isHoliday } from "@/lib/holidays";
import { DailyHistory, PomodoroHistory } from "@/types/routine";
import {
  buildDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateString,
} from "../utils/calendarDate";
import {
  getCalendarDayButtonClassName,
  getCalendarDayTextClassName,
  getCompletionDotClassName,
} from "../helpers";

type CalendarGridProps = {
  month: number;
  year: number;
  monthHistory: Record<string, DailyHistory>;
  pomodoroHistory: PomodoroHistory;
  selectedDate: string | null;
  onDateClick: (dateStr: string) => void;
};

export const CalendarGrid = ({
  month,
  year,
  monthHistory,
  pomodoroHistory,
  selectedDate,
  onDateClick,
}: CalendarGridProps) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = toDateString(today);

  const cells: React.ReactElement[] = [];

  for (let index = 0; index < firstDay; index++) {
    cells.push(
      <div key={`empty-${index}`} className="aspect-square p-1"></div>,
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = buildDateString(year, month, day);
    const history = monthHistory[dateStr];
    const completionCount = history?.completedRoutineIds.length || 0;
    const totalCount = history?.routineSnapshots.length || 0;
    const hasCompletions = completionCount > 0;
    const pomodoroCount = pomodoroHistory[dateStr]?.completedPomodoros || 0;

    const date = new Date(year, month - 1, day);
    const isToday = dateStr === todayStr;
    const isFuture = date > today;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    cells.push(
      <button
        key={dateStr}
        onClick={() => !isFuture && onDateClick(dateStr)}
        disabled={isFuture}
        className={getCalendarDayButtonClassName({
          isFuture,
          isSelected: selectedDate === dateStr,
          isToday,
        })}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span
            className={getCalendarDayTextClassName({
              isHolidayOrWeekend: isHoliday(date) || isWeekend,
              isToday,
            })}
          >
            {day}
          </span>
          {hasCompletions && (
            <div className="flex items-center gap-0.5 mt-1">
              <div
                className={getCompletionDotClassName(
                  completionCount,
                  totalCount,
                )}
              ></div>
              <span className="text-[10px] text-gray-500 dark:text-gray-600">
                {completionCount}/{totalCount}
              </span>
            </div>
          )}
          {pomodoroCount > 0 && (
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">🍅</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-700 font-semibold">
                {pomodoroCount}
              </span>
            </div>
          )}
        </div>
      </button>,
    );
  }

  return <div className="grid grid-cols-7 gap-1 mb-4">{cells}</div>;
};
