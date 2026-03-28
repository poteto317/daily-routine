import { STATUS_DISPLAY } from "./statusHelpers";
import type { CheckStatus, TestCategory, TestField } from "./types";
import {
  calculateCategoryStats,
  isItemMatchedByFilter,
  resolveItemStatus,
  type DetailData,
} from "./matrixComputations";
import testMatrixTexts from "./locales/ja.json";
import {
  getCollapseIcon,
  getStatusTitle,
} from "./helpers";

interface MatrixCategoryCardProps {
  category: TestCategory;
  detailData: DetailData;
  filterStatus: CheckStatus | "all";
  isCollapsed: boolean;
  onToggleCollapse: (categoryId: string) => void;
  onToggleStatus: (
    categoryId: string,
    itemId: string,
    field: TestField,
  ) => void;
  onUpdateNote: (categoryId: string, itemId: string, note: string) => void;
  onOpenDetail: (itemId: string) => void;
}

export const MatrixCategoryCard = ({
  category,
  detailData,
  filterStatus,
  isCollapsed,
  onToggleCollapse,
  onToggleStatus,
  onUpdateNote,
  onOpenDetail,
}: MatrixCategoryCardProps) => {
  const filteredItems = category.items.filter((item) =>
    isItemMatchedByFilter(item, detailData, filterStatus),
  );

  if (filteredItems.length === 0) {
    return null;
  }

  const categoryStats = calculateCategoryStats(category, detailData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => onToggleCollapse(category.id)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {getCollapseIcon(isCollapsed)}
          </span>
          <h2 className="text-base font-bold text-gray-800">
            {category.title}
          </h2>
          {category.badge && (
            <span
              className={`px-2 py-0.5 text-xs font-bold text-white rounded ${category.badge.color}`}
            >
              {category.badge.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {categoryStats.ngCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
              ❌{categoryStats.ngCount}
            </span>
          )}
          <span className="text-gray-400">
            {categoryStats.okCount}/{categoryStats.totalCount}
          </span>
        </div>
      </button>

      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-4 py-2 text-left font-medium text-gray-500 w-20">
                  #
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  {testMatrixTexts.categoryCard.featureHeader}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-500 w-20">
                  {testMatrixTexts.categoryCard.deviceHeaders.pc}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-500 w-20">
                  {testMatrixTexts.categoryCard.deviceHeaders.sp}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 w-1/4">
                  {testMatrixTexts.categoryCard.noteHeader}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const { detailCases, hasDetail, pcStatus, spStatus } =
                  resolveItemStatus(item, detailData);
                const detailTotal = detailCases.length;
                const detailPcOk = detailCases.filter(
                  (detail) => detail.pc === "ok",
                ).length;
                const detailSpOk = detailCases.filter(
                  (detail) => detail.sp === "ok",
                ).length;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-400 text-sm font-mono whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() =>
                          hasDetail ? onOpenDetail(item.id) : undefined
                        }
                        className={`text-left flex items-center gap-2 group ${
                          hasDetail
                            ? "cursor-pointer hover:text-blue-600"
                            : "cursor-default"
                        }`}
                      >
                        <span className="text-gray-800 group-hover:text-blue-600 transition-colors">
                          {item.label}
                        </span>
                      </button>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {hasDetail ? (
                          <div
                            className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold ${STATUS_DISPLAY[pcStatus].color}`}
                            title={getStatusTitle(
                              "PC",
                              STATUS_DISPLAY[pcStatus].label,
                              true,
                            )}
                          >
                            {STATUS_DISPLAY[pcStatus].emoji}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onToggleStatus(category.id, item.id, "pc")
                            }
                            className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold transition-all cursor-pointer select-none ${STATUS_DISPLAY[pcStatus].color}`}
                            title={getStatusTitle(
                              "PC",
                              STATUS_DISPLAY[pcStatus].label,
                              false,
                            )}
                          >
                            {STATUS_DISPLAY[pcStatus].emoji}
                          </button>
                        )}
                        {hasDetail && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            {detailPcOk}/{detailTotal}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {hasDetail ? (
                          <div
                            className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold ${STATUS_DISPLAY[spStatus].color}`}
                            title={getStatusTitle(
                              "SP",
                              STATUS_DISPLAY[spStatus].label,
                              true,
                            )}
                          >
                            {STATUS_DISPLAY[spStatus].emoji}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onToggleStatus(category.id, item.id, "sp")
                            }
                            className={`inline-flex items-center justify-center w-10 h-8 rounded-md text-lg font-bold transition-all cursor-pointer select-none ${STATUS_DISPLAY[spStatus].color}`}
                            title={getStatusTitle(
                              "SP",
                              STATUS_DISPLAY[spStatus].label,
                              false,
                            )}
                          >
                            {STATUS_DISPLAY[spStatus].emoji}
                          </button>
                        )}
                        {hasDetail && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            {detailSpOk}/{detailTotal}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(event) =>
                          onUpdateNote(category.id, item.id, event.target.value)
                        }
                        placeholder={testMatrixTexts.categoryCard.notePlaceholder}
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-transparent"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
