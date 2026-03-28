import { formatTimerLong } from "@/lib/storage";
import { getSessionCountLabel } from "../helpers";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  totalTime: number;
  sessionsCount: number;
};

export const WorkTrackerTodaySummary = ({
  totalTime,
  sessionsCount,
}: Props) => {
  return (
    <div className="bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-200 dark:to-purple-200 rounded-xl p-4 mb-8">
      <div className="text-center">
        <p className="text-gray-700 dark:text-gray-900 text-sm mb-1">
          {workTrackerTexts.todaySummary.totalLabel}
        </p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-800">
          {formatTimerLong(totalTime)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-800 mt-1">
          {getSessionCountLabel(sessionsCount)}
        </p>
      </div>
    </div>
  );
};
