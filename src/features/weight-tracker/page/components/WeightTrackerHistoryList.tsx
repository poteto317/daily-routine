import { WeightRecord } from "@/types/routine";
import { WEIGHT_TRACKER_HISTORY_LIST_TEXT } from "../helpers";
import { WeightTrackerHistoryItem } from "./WeightTrackerHistoryItem";

type WeightTrackerHistoryListProps = {
  today: string;
  recentRecords: WeightRecord[];
  onDeleteRecord: (date: string) => void;
};

export const WeightTrackerHistoryList = ({
  today,
  recentRecords,
  onDeleteRecord,
}: WeightTrackerHistoryListProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
        {WEIGHT_TRACKER_HISTORY_LIST_TEXT.title}
      </h2>

      {recentRecords.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-600 py-8">
          {WEIGHT_TRACKER_HISTORY_LIST_TEXT.empty}
        </div>
      ) : (
        <div className="space-y-2">
          {recentRecords.map((record, index) => (
            <WeightTrackerHistoryItem
              key={record.id}
              record={record}
              prevRecord={recentRecords[index + 1]}
              today={today}
              onDelete={onDeleteRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
};
