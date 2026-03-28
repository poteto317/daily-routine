import { WorkSession } from "@/types/routine";
import { formatTimerLong } from "@/lib/storage";
import { WorkTrackerSessionDeleteButton } from "./WorkTrackerSessionDeleteButton";
import {
  getSessionHistoryMeta,
  formatWorkSessionStatsSummary,
  formatWorkSessionTimeRange,
} from "../helpers";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  session: WorkSession;
  onDeleteSession: (sessionId: string) => void;
};

export const WorkTrackerSessionHistoryItem = ({
  session,
  onDeleteSession,
}: Props) => {
  const { moodOption, stats, isImprovement, isNewRecord } =
    getSessionHistoryMeta(session);

  return (
    <div className="bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-lg break-all">
              {session.workName}
            </h4>
            <span className="text-2xl shrink-0">{moodOption?.emoji}</span>
            {isNewRecord && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded shrink-0">
                {workTrackerTexts.sessionHistoryItem.newRecordLabel}
              </span>
            )}
            {!isNewRecord && isImprovement && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shrink-0">
                {workTrackerTexts.sessionHistoryItem.improvementLabel}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
            <span className="font-mono font-bold text-blue-600 shrink-0">
              {workTrackerTexts.sessionHistoryItem.timerPrefix}{" "}
              {formatTimerLong(session.duration || 0)}
            </span>
            <span className="shrink-0">
              {formatWorkSessionTimeRange(session.startTime, session.endTime)}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                moodOption?.color || "bg-gray-500"
              } text-white`}
            >
              {moodOption?.label}
            </span>
          </div>
          {stats.count > 1 && (
            <div className="text-xs text-gray-500 dark:text-gray-700 mb-2">
              {formatWorkSessionStatsSummary({
                bestDuration: formatTimerLong(stats.bestDuration),
                averageDuration: formatTimerLong(
                  Math.round(stats.averageDuration),
                ),
                count: stats.count,
              })}
            </div>
          )}
          {session.notes && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-100 rounded border-l-4 border-yellow-400">
              <p className="text-sm text-gray-700 dark:text-gray-900">
                {workTrackerTexts.sessionHistoryItem.notePrefix} {session.notes}
              </p>
            </div>
          )}
        </div>
        <WorkTrackerSessionDeleteButton
          onDelete={() => onDeleteSession(session.id)}
        />
      </div>
    </div>
  );
};
