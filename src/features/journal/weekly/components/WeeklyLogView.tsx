import type { WeeklyLogEntry } from "@/types/routine";
import journalTexts from "../../locales/ja.json";
import { formatUpdatedAt } from "../../utils/journalDate";

const texts = journalTexts.weeklyLog;

type WeeklyLogViewProps = {
  entry: WeeklyLogEntry;
  onStartEditing: () => void;
  onRemove: () => void;
};

export const WeeklyLogView = ({
  entry,
  onStartEditing,
  onRemove,
}: WeeklyLogViewProps) => (
  <div className="p-4 border border-gray-200 dark:border-gray-300 rounded-lg">
    <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap wrap-break-word">
      {entry.content}
    </p>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-600">
        {texts.updatedPrefix} {formatUpdatedAt(entry.updatedAt)}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onStartEditing}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-700 dark:hover:text-purple-800 whitespace-nowrap text-sm font-medium"
        >
          {texts.editButtonLabel}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 dark:text-red-700 dark:hover:text-red-800 whitespace-nowrap text-sm font-medium"
        >
          {texts.deleteButtonLabel}
        </button>
      </div>
    </div>
  </div>
);
