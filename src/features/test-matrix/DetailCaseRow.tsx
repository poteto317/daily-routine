import type { DetailTestCase } from "./detailedTestCases";
import testMatrixTexts from "./locales/ja.json";
import { getDeviceTitleText } from "./helpers";
import { STATUS_DISPLAY } from "./statusHelpers";
import type { TestField } from "./types";

interface DetailCaseRowProps {
  caseItem: DetailTestCase;
  index: number;
  onToggleStatus: (caseId: string, field: TestField) => void;
  onUpdateNote: (caseId: string, note: string) => void;
}

export const DetailCaseRow = ({
  caseItem,
  index,
  onToggleStatus,
  onUpdateNote,
}: DetailCaseRowProps) => (
  <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
    <td className="px-3 py-2 text-gray-400 text-xs font-mono">{index + 1}</td>
    <td className="px-3 py-2 text-gray-800">{caseItem.scenario}</td>
    <td className="px-3 py-2 text-gray-600 text-xs">{caseItem.expected}</td>
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
        onChange={(event) => onUpdateNote(caseItem.id, event.target.value)}
        placeholder={testMatrixTexts.detailPanel.notePlaceholder}
        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent"
      />
    </td>
  </tr>
);
