import { type WeightRecord } from "@/types/routine";
import {
  calculateWeightChange,
  formatWeightChange,
  formatWeightDate,
  formatWeightHistoryNote,
  getWeightChangeClassName,
  WEIGHT_HISTORY_DELETE_ARIA_LABEL,
  WEIGHT_HISTORY_TODAY_BADGE,
} from "../helpers";

type WeightTrackerHistoryItemProps = {
  record: WeightRecord;
  prevRecord: WeightRecord | undefined;
  today: string;
  onDelete: (date: string) => void;
};

export const WeightTrackerHistoryItem = ({
  record,
  prevRecord,
  today,
  onDelete,
}: WeightTrackerHistoryItemProps) => {
  const change = prevRecord
    ? calculateWeightChange(record.weight, prevRecord.weight)
    : null;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-800">
            {formatWeightDate(record.date)}
          </span>
          {record.date === today && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
              {WEIGHT_HISTORY_TODAY_BADGE}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-900">
            {record.weight.toFixed(1)} kg
          </span>
          {change !== null && (
            <span className={getWeightChangeClassName(change)}>
              {formatWeightChange(change)}
            </span>
          )}
        </div>
        {record.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-700 mt-1">
            {formatWeightHistoryNote(record.notes)}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(record.date)}
        className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-100 rounded-lg transition-colors"
        aria-label={WEIGHT_HISTORY_DELETE_ARIA_LABEL}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
