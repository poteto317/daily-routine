import calendarTexts from "../locales/ja.json";
import { getWeekDayClassName } from "../helpers";

export const CalendarWeekHeader = () => {
  return (
    <div className="grid grid-cols-7 gap-1 mb-2 mt-6">
      {calendarTexts.weekHeader.weekDays.map((day, index) => (
        <div key={day} className={getWeekDayClassName(index)}>
          {day}
        </div>
      ))}
    </div>
  );
};
