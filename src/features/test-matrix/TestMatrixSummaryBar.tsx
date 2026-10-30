import testMatrixTexts from "./locales/ja.json";
import { getTotalItemsLabel } from "./helpers";

interface TestMatrixSummaryBarProps {
  totalCount: number;
  okCount: number;
  ngCount: number;
  uncheckedCount: number;
  progressPct: number;
}

export const TestMatrixSummaryBar = ({
  totalCount,
  okCount,
  ngCount,
  uncheckedCount,
  progressPct,
}: TestMatrixSummaryBarProps) => (
  <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex flex-wrap items-center gap-4 mb-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {testMatrixTexts.page.progressLabel}
        </span>
        <span className="text-lg font-bold text-blue-600">{progressPct}%</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
          ✅ {okCount}
        </span>
        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
          ❌ {ngCount}
        </span>
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
          ⬜ {uncheckedCount}
        </span>
        <span className="text-gray-400">{getTotalItemsLabel(totalCount)}</span>
      </div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="h-2.5 rounded-full transition-all duration-500 bg-blue-500"
        style={{ width: `${progressPct}%` }}
      />
    </div>
  </div>
);
