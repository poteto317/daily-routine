import texts from "./locales/ja.json";

export const buildWorkoutRecordDeleteConfirmMessage = (
  exerciseName: string,
): string => texts.page.confirmDeleteTemplate.replace("{name}", exerciseName);
