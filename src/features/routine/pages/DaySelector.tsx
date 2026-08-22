"use client";

import type { HomeDaySelectorProps as DaySelectorProps } from "./homeTypes";
import {
  DAYS,
  DAY_SELECTOR_TEXT,
  getDaySelectorButtonClassName,
} from "./daySelectorPresentation";

/**
 * 曜日切り替えコンポーネント
 * 曜日タブと祝日タブを表示し、選択された曜日のルーティンを表示するためのフィルター
 */
export const DaySelector = ({
  viewMode,
  onViewModeChangeAction,
  sortedDaysAndHoliday,
}: DaySelectorProps) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sortedDaysAndHoliday.map((item) => {
          if (item === "holiday") {
            return (
              <button
                key="holiday"
                onClick={() => onViewModeChangeAction("holiday")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${getDaySelectorButtonClassName(
                  viewMode === "holiday",
                  true,
                )}`}
              >
                {DAY_SELECTOR_TEXT.holiday}
              </button>
            );
          } else {
            return (
              <button
                key={item.value}
                onClick={() => onViewModeChangeAction(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${getDaySelectorButtonClassName(
                  viewMode === item.value,
                  false,
                )}`}
              >
                {item.label}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
};

export { DAYS };
