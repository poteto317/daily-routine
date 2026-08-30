import { getCategoryInfo } from "@/features/routine";
import type { Routine } from "@/types/routine";

type PresetSourceRoutinePreviewProps = {
  routines: Routine[];
  emptyLabel: string;
};

export const PresetSourceRoutinePreview = ({
  routines,
  emptyLabel,
}: PresetSourceRoutinePreviewProps) => (
  <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 dark:border-gray-600">
    {routines.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyLabel}</p>
    ) : (
      routines.map((routine) => {
        const categoryInfo = getCategoryInfo(routine);
        return (
          <div
            key={routine.id}
            className="flex items-center gap-2 p-1.5 text-sm text-gray-900 dark:text-white"
          >
            <span className="flex-1">
              {categoryInfo.emoji} {routine.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {routine.startTime}
            </span>
          </div>
        );
      })
    )}
  </div>
);
