import texts from "../locales/ja.json";

export const ROUTINE_EMPTY_STATE_TEXT = texts.emptyState;

export const getEmptyMessage = (
  allRoutinesCount: number,
  viewMode: "holiday" | number,
): string => {
  if (allRoutinesCount === 0) return ROUTINE_EMPTY_STATE_TEXT.noRoutines;
  return viewMode === "holiday"
    ? ROUTINE_EMPTY_STATE_TEXT.noHolidayRoutines
    : ROUTINE_EMPTY_STATE_TEXT.noDayRoutines;
};

export const getAddButtonLabel = (allRoutinesCount: number): string =>
  allRoutinesCount === 0
    ? ROUTINE_EMPTY_STATE_TEXT.addFirst
    : ROUTINE_EMPTY_STATE_TEXT.addMore;
