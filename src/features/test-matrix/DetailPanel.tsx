import type { DetailTestCase } from "./detailedTestCases";
import testMatrixTexts from "./locales/ja.json";
import { DetailCaseRow } from "./DetailCaseRow";
import { DetailPanelHeader } from "./DetailPanelHeader";
import type { TestField } from "./types";
import { useCloseOnEscape } from "@/hooks/useCloseOnEscape";

/**
 * パネル見出しに付与する id。
 * ダイアログ本体の aria-labelledby から参照してアクセシブル名にするため、
 * 参照する側と付与する側で同じ値を共有する。
 */
const DETAIL_PANEL_TITLE_ID = "test-matrix-detail-panel-title";

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
  // aria-modal を宣言している以上、Escape で閉じられる必要がある
  useCloseOnEscape({ isActive: true, onClose });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={DETAIL_PANEL_TITLE_ID}
        className="relative ml-auto w-full max-w-3xl bg-white shadow-xl overflow-y-auto animate-slide-in-right"
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.2s ease-out;
          }
        `}</style>
        <DetailPanelHeader
          itemId={itemId}
          itemLabel={itemLabel}
          titleId={DETAIL_PANEL_TITLE_ID}
          cases={cases}
          onClose={onClose}
        />

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
                <DetailCaseRow
                  key={caseItem.id}
                  caseItem={caseItem}
                  index={index}
                  onToggleStatus={onToggleStatus}
                  onUpdateNote={onUpdateNote}
                />
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
