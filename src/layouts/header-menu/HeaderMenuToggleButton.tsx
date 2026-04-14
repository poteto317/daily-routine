import { uiTextConfig } from "@/config";

type Props = {
  isMenuOpen: boolean;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  onToggleClick: () => void;
  panelId: string;
};

export const HeaderMenuToggleButton = ({
  isMenuOpen,
  menuButtonRef,
  onToggleClick,
  panelId,
}: Props) => {
  return (
    <button
      ref={menuButtonRef}
      type="button"
      onClick={onToggleClick}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-300 transition-colors"
      aria-label={uiTextConfig.menu.label}
      aria-expanded={isMenuOpen}
      aria-controls={panelId}
      aria-haspopup="menu"
    >
      <svg
        className="w-6 h-6 text-gray-700 dark:text-black"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isMenuOpen ? (
          <path d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
};
