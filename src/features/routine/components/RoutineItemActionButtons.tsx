import { ROUTINE_ITEM_ACTION_BUTTONS_TEXT } from "./helpers";

type RoutineItemActionButtonsProps = {
  onEditAction: () => void;
  onDeleteAction: () => void;
};

export const RoutineItemActionButtons = ({
  onEditAction,
  onDeleteAction,
}: RoutineItemActionButtonsProps) => {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={onEditAction}
        className="p-2 text-blue-600 dark:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-100 rounded transition-colors"
        aria-label={ROUTINE_ITEM_ACTION_BUTTONS_TEXT.editAriaLabel}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={onDeleteAction}
        className="p-2 text-red-600 dark:text-red-700 hover:bg-red-50 dark:hover:bg-red-100 rounded transition-colors"
        aria-label={ROUTINE_ITEM_ACTION_BUTTONS_TEXT.deleteAriaLabel}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
