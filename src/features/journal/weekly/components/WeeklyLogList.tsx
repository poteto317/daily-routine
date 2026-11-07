import type { WeeklyLogEntry } from "@/types/routine";
import journalTexts from "../../locales/ja.json";
import { formatUpdatedAt } from "../../utils/journalDate";
import {
  buildWeeklyLogOpenAriaLabel,
  formatWeeklyLogWeekTitle,
} from "../weeklyLogTexts";

const texts = journalTexts.weeklyLog;

type WeeklyLogListProps = {
  entries: WeeklyLogEntry[];
  selectedWeekStart: string;
  canOpen: boolean;
  onOpenWeek: (weekStart: string) => void;
};

export const WeeklyLogList = ({
  entries,
  selectedWeekStart,
  canOpen,
  onOpenWeek,
}: WeeklyLogListProps) => (
  <div className="mt-6">
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900 mb-3">
      {texts.listTitle}
    </h3>
    {entries.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-600 text-center py-4">
        {texts.listEmpty}
      </p>
    ) : (
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.weekStart}
            className="p-3 border border-gray-200 dark:border-gray-300 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-700">
                {formatWeeklyLogWeekTitle(entry.weekStart)}
              </span>
              {entry.weekStart === selectedWeekStart ? (
                <span className="shrink-0 whitespace-nowrap text-xs text-purple-700 dark:text-purple-800">
                  {texts.viewingLabel}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenWeek(entry.weekStart)}
                  disabled={!canOpen}
                  aria-label={buildWeeklyLogOpenAriaLabel(entry.weekStart)}
                  className="shrink-0 whitespace-nowrap text-purple-600 hover:text-purple-700 dark:text-purple-700 dark:hover:text-purple-800 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {texts.openButtonLabel}
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap wrap-break-word line-clamp-3">
              {entry.content}
            </p>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-600">
              {texts.updatedPrefix} {formatUpdatedAt(entry.updatedAt)}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
