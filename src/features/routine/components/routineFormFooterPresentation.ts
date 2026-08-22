import texts from "../locales/ja.json";

export const ROUTINE_FORM_FOOTER_TEXT = texts.routineFormFooter;

export const getRoutineFormSubmitLabel = (isEditMode: boolean): string =>
  isEditMode ? ROUTINE_FORM_FOOTER_TEXT.update : ROUTINE_FORM_FOOTER_TEXT.add;

export const getSubmitButtonClassName = (isDisabled: boolean): string => {
  const base = "flex-1 px-4 py-2 rounded-lg transition-colors";
  return isDisabled
    ? `${base} bg-gray-400 text-gray-200 cursor-not-allowed`
    : `${base} bg-blue-600 text-white hover:bg-blue-700`;
};
