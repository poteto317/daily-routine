import workTrackerTexts from "../../locales/ja.json";

type Props = {
  onDelete: () => void;
};

export const WorkTrackerSessionDeleteButton = ({ onDelete }: Props) => {
  return (
    <button
      onClick={onDelete}
      className="sm:ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-100 rounded-lg transition-colors shrink-0 self-start"
      aria-label={workTrackerTexts.sessionHistory.deleteAriaLabel}
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
  );
};
