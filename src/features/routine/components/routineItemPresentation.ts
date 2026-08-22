import texts from "../locales/ja.json";

export const ROUTINE_ITEM_ACTION_BUTTONS_TEXT = texts.routineItemActions;
export const ROUTINE_ITEM_EDIT_LABEL = texts.routineItemActions.editLabel;
export const ROUTINE_ITEM_DELETE_LABEL = texts.routineItemActions.deleteLabel;

export const shouldUseSwipeOnlyRoutineItem = (isEditMode: boolean): boolean =>
  !isEditMode;
