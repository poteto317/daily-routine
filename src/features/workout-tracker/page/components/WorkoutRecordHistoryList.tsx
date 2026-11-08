"use client";

import type { WorkoutRecord } from "@/types/routine";
import texts from "../../locales/ja.json";
import type { WorkoutRecordDateGroup } from "../../workoutRecordGrouping";
import { WorkoutRecordHistoryItem } from "./WorkoutRecordHistoryItem";

type WorkoutRecordHistoryListProps = {
  groups: WorkoutRecordDateGroup[];
  onDeleteRecordAction: (record: WorkoutRecord) => void;
};

/**
 * 運動記録の履歴一覧。日付ごとにグルーピングして新しい順に表示する。
 */
export const WorkoutRecordHistoryList = ({
  groups,
  onDeleteRecordAction,
}: WorkoutRecordHistoryListProps) => (
  <div className="space-y-4">
    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-700">
      {texts.historyList.title}
    </h2>

    {groups.length === 0 ? (
      <p className="text-sm text-gray-400 dark:text-gray-600">
        {texts.historyList.empty}
      </p>
    ) : (
      groups.map((group) => (
        <div key={group.date}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-600 mb-1.5">
            {group.date}
          </p>
          <ul className="space-y-2">
            {group.records.map((record) => (
              <WorkoutRecordHistoryItem
                key={record.id}
                record={record}
                onDeleteAction={onDeleteRecordAction}
              />
            ))}
          </ul>
        </div>
      ))
    )}
  </div>
);
