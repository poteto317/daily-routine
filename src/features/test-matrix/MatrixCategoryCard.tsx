import type { CheckStatus, TestCategory, TestField } from "./types";
import {
  calculateCategoryStats,
  isItemMatchedByFilter,
  type DetailData,
} from "./matrixComputations";
import testMatrixTexts from "./locales/ja.json";
import { getCollapseIcon } from "./helpers";
import { MatrixItemRow } from "./MatrixItemRow";

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
              {filteredItems.map((item) => (
                <MatrixItemRow
                  key={item.id}
                  categoryId={category.id}
                  item={item}
                  detailData={detailData}
                  onToggleStatus={onToggleStatus}
                  onUpdateNote={onUpdateNote}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
