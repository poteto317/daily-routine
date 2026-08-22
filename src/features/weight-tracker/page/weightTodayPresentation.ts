import texts from "../locales/ja.json";

export const WEIGHT_TODAY_TITLE = texts.todayCard.title;
export const WEIGHT_TODAY_ADD_LABEL = texts.todayCard.addLabel;
export const WEIGHT_TODAY_EDIT_LABEL = texts.todayCard.editLabel;
export const WEIGHT_TODAY_NOTE_PREFIX = texts.todayCard.notePrefix;
export const WEIGHT_TODAY_UPDATED_AT_LABEL = texts.todayCard.updatedAtLabel;
export const WEIGHT_TODAY_EMPTY_LABEL = texts.todayCard.emptyLabel;

export const getWeightTodayEditButtonLabel = (hasRecord: boolean): string =>
  hasRecord ? WEIGHT_TODAY_EDIT_LABEL : WEIGHT_TODAY_ADD_LABEL;

export const formatWeightTodayNote = (notes: string): string =>
  `${WEIGHT_TODAY_NOTE_PREFIX} ${notes}`;
