type PeriodNavButtonProps = {
  direction: "previous" | "next";
  onClick: () => void;
  ariaLabel: string | undefined;
  type: "button" | undefined;
};

const CHEVRON_PATHS = {
  previous: "M15 19l-7-7 7-7",
  next: "M9 5l7 7-7 7",
} as const;

/** 月・期間を前後に切り替える矢印ボタン。 */
export const PeriodNavButton = ({
  direction,
  onClick,
  ariaLabel,
  type,
}: PeriodNavButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    aria-label={ariaLabel}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
  >
    <svg
      className="w-5 h-5 text-gray-700 dark:text-gray-800"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d={CHEVRON_PATHS[direction]} />
    </svg>
  </button>
);
