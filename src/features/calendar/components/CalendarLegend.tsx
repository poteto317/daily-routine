import calendarTexts from "../locales/ja.json";

export const CalendarLegend = () => {
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-700 mb-4">
      {calendarTexts.legend.items.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <div className={item.colorClassName}></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
