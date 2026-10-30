import type { DetailTestCase } from "./detailedTestCases";
import testMatrixTexts from "./locales/ja.json";
import { getTotalCasesLabel } from "./helpers";

interface DetailPanelHeaderProps {
  itemId: string;
  itemLabel: string;
  titleId: string;
  cases: DetailTestCase[];
  onClose: () => void;
}

export const DetailPanelHeader = ({
  itemId,
  itemLabel,
  titleId,
  cases,
  onClose,
}: DetailPanelHeaderProps) => {
  const allCases = cases.length;
  const okCases = cases.filter(
    (caseItem) => caseItem.pc === "ok" && caseItem.sp === "ok",
  ).length;
  const ngCases = cases.filter(
    (caseItem) => caseItem.pc === "ng" || caseItem.sp === "ng",
  ).length;
  const uncheckedCases = cases.filter(
    (caseItem) => caseItem.pc === "unchecked" || caseItem.sp === "unchecked",
  ).length;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title={testMatrixTexts.detailPanel.closeTitle}
          aria-label={testMatrixTexts.detailPanel.closeTitle}
        >
          <span aria-hidden="true">✕</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 font-mono">{itemId}</div>
          <h2 id={titleId} className="text-lg font-bold text-gray-800 truncate">
            {itemLabel}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
          ✅ {okCases}
        </span>
        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
          ❌ {ngCases}
        </span>
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
          ⬜ {uncheckedCases}
        </span>
        <span className="text-gray-400">{getTotalCasesLabel(allCases)}</span>
      </div>
    </div>
  );
};
