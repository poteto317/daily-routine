import presetTexts from "./locales/ja.json";

type RoutineTemplateSummary = {
  categoryEmoji: string;
  title: string;
  startTime: string;
  duration: number;
};

export const PRESET_ROUTINE_COUNT_SUFFIX = presetTexts.card.routineCountSuffix;
export const PRESET_APPLY_LABEL = presetTexts.card.applyLabel;
export const PRESET_EDIT_LABEL = presetTexts.card.editLabel;
export const PRESET_DELETE_LABEL = presetTexts.card.deleteLabel;
export const PRESET_DUPLICATE_LABEL = presetTexts.card.duplicateLabel;

export const getPresetCardClassName = (isSelected: boolean): string =>
  `p-4 border-2 rounded-lg cursor-pointer transition-all ${
    isSelected
      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
  }`;

export const getDayButtonClassName = (
  isSelected: boolean,
  isHoliday = false,
): string => {
  if (isHoliday) {
    return `px-3 py-2 rounded-lg transition-colors ${
      isSelected
        ? "bg-red-500 text-white"
        : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
    }`;
  }

  return `px-3 py-2 rounded-lg transition-colors ${
    isSelected
      ? "bg-blue-500 text-white"
      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
  }`;
};

export const isApplyButtonDisabled = (
  selectedDayCount: number,
  routineTemplateCount: number,
): boolean => selectedDayCount === 0 || routineTemplateCount === 0;

export const formatRoutineTemplateSummary = (
  summary: RoutineTemplateSummary,
): string =>
  `${summary.categoryEmoji} ${summary.title} (${summary.startTime}, ${summary.duration}分)`;
