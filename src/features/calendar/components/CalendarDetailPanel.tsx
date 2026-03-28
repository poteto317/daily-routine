import { DailyHistory } from "@/types/routine";
import calendarTexts from "../locales/ja.json";
import {
  formatCalendarDetailRate,
  getCalendarDetailItemClassName,
  getCalendarDetailStatusIcon,
} from "../helpers";

type CalendarDetailPanelProps = {
  selectedDate: string | null;
  selectedHistory: DailyHistory | null;
};

export const CalendarDetailPanel = ({
  selectedDate,
  selectedHistory,
}: CalendarDetailPanelProps) => {
  if (!selectedDate) {
    return null;
  }

  if (!selectedHistory) {
    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-200 rounded-lg">
        <p className="text-gray-600 dark:text-gray-700 text-center">
          {selectedDate} {calendarTexts.detailPanel.emptyHistorySuffix}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-100 rounded-lg">
      <h4 className="font-bold text-gray-900 dark:text-gray-900 mb-3">
        {selectedDate} {calendarTexts.detailPanel.titleSuffix}
      </h4>
      {selectedHistory.routineSnapshots.length > 0 ? (
        <div className="space-y-2">
          {selectedHistory.routineSnapshots.map((routine) => {
            const isCompleted = selectedHistory.completedRoutineIds.includes(
              routine.id,
            );
            return (
              <div
                key={routine.id}
                className={getCalendarDetailItemClassName(isCompleted)}
              >
                <span className="text-lg">
                  {getCalendarDetailStatusIcon(isCompleted)}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-900">
                    {routine.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-700">
                    {routine.startTime}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-3 text-sm text-gray-700 dark:text-gray-800">
            {calendarTexts.detailPanel.rateLabel}{" "}
            {formatCalendarDetailRate(
              selectedHistory.completedRoutineIds.length,
              selectedHistory.routineSnapshots.length,
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-700">
          {calendarTexts.detailPanel.noRoutineLabel}
        </p>
      )}
    </div>
  );
};
