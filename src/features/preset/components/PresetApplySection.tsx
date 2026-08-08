import { type RoutinePreset, ROUTINE_CATEGORIES } from "@/types/routine";
import { DAY_LABELS } from "@/features/preset/presetConstants";
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  isApplyButtonDisabled,
  PRESET_APPLY_LABEL,
} from "../helpers";

type Props = {
  preset: RoutinePreset;
  selectedDays: Set<number>;
  onToggleDay: (day: number) => void;
  onApply: () => void;
};

/** プリセットカードの適用モードUI（ルーティン概要 + 曜日選択 + 適用ボタン） */
export const PresetApplySection = ({
  preset,
  selectedDays,
  onToggleDay,
  onApply,
}: Props) => (
  <div className="mt-4 pt-4 border-t dark:border-gray-600">
    <div className="space-y-1 mb-4">
      {preset.routineTemplates.map((template, index) => {
        const categoryInfo = ROUTINE_CATEGORIES.find(
          (item) => item.value === template.category,
        );
        return (
          <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
            {formatRoutineTemplateSummary({
              categoryEmoji: categoryInfo?.emoji ?? "",
              title: template.title,
              startTime: template.startTime,
              duration: template.duration,
            })}
          </div>
        );
      })}
    </div>

    <div className="mb-4 flex gap-2 flex-wrap">
      {DAY_LABELS.map((label, day) => (
        <button
          key={day}
          onClick={(event) => {
            event.stopPropagation();
            onToggleDay(day);
          }}
          className={getDayButtonClassName(selectedDays.has(day), day === 7)}
        >
          {label}
        </button>
      ))}
    </div>

    <button
      onClick={(event) => {
        event.stopPropagation();
        onApply();
      }}
      disabled={isApplyButtonDisabled(selectedDays.size)}
      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
    >
      {PRESET_APPLY_LABEL}
    </button>
  </div>
);
