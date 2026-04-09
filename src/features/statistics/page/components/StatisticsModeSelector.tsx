import { type ViewMode } from "../types";
import { STATISTICS_MODE_OPTIONS } from "../../helpers";

type Props = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const buttonClass = (active: boolean) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
    active
      ? "bg-blue-600 text-white shadow-md"
      : "bg-gray-100 dark:bg-gray-200 text-gray-700 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300"
  }`;

export const StatisticsModeSelector = ({ viewMode, onChange }: Props) => (
  <div className="flex gap-2 mb-6">
    {STATISTICS_MODE_OPTIONS.map((option) => (
      <button
        key={option.mode}
        onClick={() => onChange(option.mode)}
        className={buttonClass(viewMode === option.mode)}
      >
        {option.label}
      </button>
    ))}
  </div>
);
