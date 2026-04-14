import { uiTextConfig } from "@/config";

type HeaderEditModeButtonProps = {
  isEditMode: boolean;
  onToggleEditModeAction: () => void;
};

export const HeaderEditModeButton = ({
  isEditMode,
  onToggleEditModeAction,
}: HeaderEditModeButtonProps) => {
  return (
    <button
      onClick={onToggleEditModeAction}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-200 transition-colors cursor-pointer"
      aria-label={
        isEditMode
          ? uiTextConfig.editMode.toggle.disable
          : uiTextConfig.editMode.toggle.enable
      }
      title={
        isEditMode
          ? uiTextConfig.editMode.toggle.disable
          : uiTextConfig.editMode.toggle.enable
      }
    >
      {isEditMode ? (
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
};
