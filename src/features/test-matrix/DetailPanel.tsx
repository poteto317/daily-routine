import type { DetailTestCase } from "./detailedTestCases";
import testMatrixTexts from "./locales/ja.json";
import {
  getTotalCasesLabel,
  getDeviceTitleText,
} from "./helpers";
import { STATUS_DISPLAY } from "./statusHelpers";
import type { TestField } from "./types";

interface DetailPanelProps {
  itemId: string;
  itemLabel: string;
  cases: DetailTestCase[];
  onClose: () => void;
  onToggleStatus: (caseId: string, field: TestField) => void;
  onUpdateNote: (caseId: string, note: string) => void;
}

export const DetailPanel = ({
  itemId,
  itemLabel,
  cases,
  onClose,
  onToggleStatus,
  onUpdateNote,
}: DetailPanelProps) => {
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
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-3xl bg-white shadow-xl overflow-y-auto animate-slide-in-right">
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.2s ease-out;
          }
        `}</style>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title={testMatrixTexts.detailPanel.closeTitle}
            >
              ✕
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 font-mono">{itemId}</div>
              <h2 className="text-lg font-bold text-gray-800 truncate">
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
            <span className="text-gray-400">
              {getTotalCasesLabel(allCases)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-12">
                  #
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">
                  {testMatrixTexts.detailPanel.scenarioHeader}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-1/4">
                  {testMatrixTexts.detailPanel.expectedHeader}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-500 w-16">
                  {testMatrixTexts.detailPanel.deviceHeaders.pc}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-500 w-16">
                  {testMatrixTexts.detailPanel.deviceHeaders.sp}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-32">
                  {testMatrixTexts.detailPanel.noteHeader}
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem, index) => (
                <tr
                  key={caseItem.id}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-400 text-xs font-mono">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {caseItem.scenario}
                  </td>
                  <td className="px-3 py-2 text-gray-600 text-xs">
                    {caseItem.expected}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onToggleStatus(caseItem.id, "pc")}
                      className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold transition-all cursor-pointer select-none ${STATUS_DISPLAY[caseItem.pc].color}`}
                      title={getDeviceTitleText(
                        testMatrixTexts.detailPanel.deviceHeaders.pc,
                        STATUS_DISPLAY[caseItem.pc].label,
                      )}
                    >
                      {STATUS_DISPLAY[caseItem.pc].emoji}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => onToggleStatus(caseItem.id, "sp")}
                      className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold transition-all cursor-pointer select-none ${STATUS_DISPLAY[caseItem.sp].color}`}
                      title={getDeviceTitleText(
                        testMatrixTexts.detailPanel.deviceHeaders.sp,
                        STATUS_DISPLAY[caseItem.sp].label,
                      )}
                    >
                      {STATUS_DISPLAY[caseItem.sp].emoji}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={caseItem.note}
                      onChange={(event) =>
                        onUpdateNote(caseItem.id, event.target.value)
                      }
                      placeholder={testMatrixTexts.detailPanel.notePlaceholder}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cases.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            {testMatrixTexts.detailPanel.emptyCases}
          </div>
        )}
      </div>
    </div>
  );
};
