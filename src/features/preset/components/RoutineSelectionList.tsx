import { getCategoryInfo } from "@/features/routine";
import type { RoutineSelectionGroup } from "../presetRoutineGrouping";

type RoutineSelectionListProps = {
  groups: RoutineSelectionGroup[];
  selectedRoutineIds: Set<string>;
  onToggleRoutine: (routineId: string) => void;
  emptyLabel: string;
};

/**
 * プリセットに含めるルーティンを選ぶチェックボックスの一覧。
 *
 * 並び順は決めず、渡された groups の順にそのまま描く。編集画面は時刻順、
 * 新規作成画面は保存順というように、順序の都合は画面ごとに違うため。
 */
export const RoutineSelectionList = ({
  groups,
  selectedRoutineIds,
  onToggleRoutine,
  emptyLabel,
}: RoutineSelectionListProps) => {
  if (groups.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyLabel}</p>
    );
  }

  return (
    <>
      {groups.map((group) => {
        const categoryInfo = getCategoryInfo(group.routine);

        return (
          <label
            key={group.key}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedRoutineIds.has(group.routine.id)}
              onChange={() => onToggleRoutine(group.routine.id)}
              className="w-4 h-4"
            />
            <span className="flex-1 text-sm text-gray-900 dark:text-white">
              {categoryInfo.emoji} {group.routine.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.routine.startTime}
            </span>
          </label>
        );
      })}
    </>
  );
};
