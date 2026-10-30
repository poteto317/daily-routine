import testMatrixTexts from "./locales/ja.json";
import { getCollapseAllButtonLabel } from "./helpers";
import type { CheckStatus } from "./types";

interface TestMatrixToolbarProps {
  collapseAll: boolean;
  filterStatus: CheckStatus | "all";
  onCollapseAll: () => void;
  onChangeFilter: (status: CheckStatus | "all") => void;
  onReset: () => void;
}

export const TestMatrixToolbar = ({
  collapseAll,
  filterStatus,
  onCollapseAll,
  onChangeFilter,
  onReset,
}: TestMatrixToolbarProps) => (
  <div className="mb-4 flex flex-wrap gap-2">
    <button
      onClick={onCollapseAll}
      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
    >
      {getCollapseAllButtonLabel(collapseAll)}
    </button>
    <select
      value={filterStatus}
      onChange={(e) => onChangeFilter(e.target.value as CheckStatus | "all")}
      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white"
    >
      {testMatrixTexts.page.filterOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <button
      onClick={onReset}
      className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors ml-auto"
    >
      {testMatrixTexts.page.reset}
    </button>
  </div>
);
