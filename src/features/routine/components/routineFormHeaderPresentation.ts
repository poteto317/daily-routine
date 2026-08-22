import texts from "../locales/ja.json";

export const ROUTINE_FORM_HEADER_TEXT = texts.routineFormHeader;
export const ROUTINE_FORM_TITLE_ID = "routine-form-title";

export const getRoutineFormHeaderTitle = (isEditMode: boolean): string =>
  isEditMode
    ? ROUTINE_FORM_HEADER_TEXT.editTitle
    : ROUTINE_FORM_HEADER_TEXT.newTitle;
