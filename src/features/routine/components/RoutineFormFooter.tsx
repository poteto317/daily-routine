import {
  ROUTINE_FORM_FOOTER_TEXT,
  getRoutineFormSubmitLabel,
  getSubmitButtonClassName,
} from "./routineFormFooterPresentation";

type RoutineFormFooterProps = {
  isEditMode: boolean;
  onCancel: () => void;
  isSubmitDisabled: boolean;
};

export const RoutineFormFooter = ({
  isEditMode,
  onCancel,
  isSubmitDisabled,
}: RoutineFormFooterProps) => {
  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-100 z-10 flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-300">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {ROUTINE_FORM_FOOTER_TEXT.cancel}
      </button>
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={getSubmitButtonClassName(isSubmitDisabled)}
      >
        {getRoutineFormSubmitLabel(isEditMode)}
      </button>
    </div>
  );
};
