import { PeriodNavButton } from "@/components";
import { type ViewMode } from "../types";
import {
  getCurrentPeriodLabel,
  STATISTICS_PERIOD_NEXT_LABEL,
  STATISTICS_PERIOD_PREVIOUS_LABEL,
} from "../../statisticsPeriodPresentation";

type Props = {
  viewMode: ViewMode;
  periodLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export const StatisticsPeriodControls = ({
  viewMode,
  periodLabel,
  onPrevious,
  onNext,
  onToday,
}: Props) => (
  <div className="flex items-center justify-between mb-6">
    <PeriodNavButton
      direction="previous"
      onClick={onPrevious}
      ariaLabel={STATISTICS_PERIOD_PREVIOUS_LABEL}
      type="button"
    />
    <div className="flex items-center gap-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">
        {periodLabel}
      </h3>
      <button
        onClick={onToday}
        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors"
      >
        {getCurrentPeriodLabel(viewMode)}
      </button>
    </div>
    <PeriodNavButton
      direction="next"
      onClick={onNext}
      ariaLabel={STATISTICS_PERIOD_NEXT_LABEL}
      type="button"
    />
  </div>
);
