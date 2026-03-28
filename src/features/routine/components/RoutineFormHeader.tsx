import {
  ROUTINE_FORM_HEADER_TEXT,
  getRoutineFormHeaderTitle,
} from "./helpers";

type RoutineFormHeaderProps = {
  isEditMode: boolean;
  onCancel: () => void;
};

export const RoutineFormHeader = ({
  isEditMode,
  onCancel,
}: RoutineFormHeaderProps) => {
  return (
    <div className="sticky top-0 bg-white dark:bg-slate-100 z-10 flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {getRoutineFormHeaderTitle(isEditMode)}
      </h2>
      <button
        type="button"
        onClick={onCancel}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label={ROUTINE_FORM_HEADER_TEXT.closeAriaLabel}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
