import { MatrixDeviceStatusCell } from "./MatrixDeviceStatusCell";
import { resolveItemStatus, type DetailData } from "./matrixComputations";
import testMatrixTexts from "./locales/ja.json";
import type { TestField, TestItem } from "./types";

interface MatrixItemRowProps {
  categoryId: string;
  item: TestItem;
  detailData: DetailData;
  onToggleStatus: (
    categoryId: string,
    itemId: string,
    field: TestField,
  ) => void;
  onUpdateNote: (categoryId: string, itemId: string, note: string) => void;
  onOpenDetail: (itemId: string) => void;
}

export const MatrixItemRow = ({
  categoryId,
  item,
  detailData,
  onToggleStatus,
  onUpdateNote,
  onOpenDetail,
}: MatrixItemRowProps) => {
  const { detailCases, hasDetail, pcStatus, spStatus } = resolveItemStatus(
    item,
    detailData,
  );
  const detailTotal = detailCases.length;
  const detailPcOk = detailCases.filter((detail) => detail.pc === "ok").length;
  const detailSpOk = detailCases.filter((detail) => detail.sp === "ok").length;

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-2 text-gray-400 text-sm font-mono whitespace-nowrap">
        {item.id}
      </td>
      <td className="px-4 py-2">
        <button
          onClick={() => (hasDetail ? onOpenDetail(item.id) : undefined)}
          className={`text-left flex items-center gap-2 group ${
            hasDetail ? "cursor-pointer hover:text-blue-600" : "cursor-default"
          }`}
        >
          <span className="text-gray-800 group-hover:text-blue-600 transition-colors">
            {item.label}
          </span>
        </button>
      </td>
      <MatrixDeviceStatusCell
        status={pcStatus}
        statusTitleLabel="PC"
        hasDetail={hasDetail}
        okCount={detailPcOk}
        totalCount={detailTotal}
        onToggle={() => onToggleStatus(categoryId, item.id, "pc")}
      />
      <MatrixDeviceStatusCell
        status={spStatus}
        statusTitleLabel="SP"
        hasDetail={hasDetail}
        okCount={detailSpOk}
        totalCount={detailTotal}
        onToggle={() => onToggleStatus(categoryId, item.id, "sp")}
      />
      <td className="px-4 py-2">
        <input
          type="text"
          value={item.note}
          onChange={(event) =>
            onUpdateNote(categoryId, item.id, event.target.value)
          }
          placeholder={testMatrixTexts.categoryCard.notePlaceholder}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent"
        />
      </td>
    </tr>
  );
};
